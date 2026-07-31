const fs = require("fs");
const path = require("path");
const express = require("express");
const { query, queryOne } = require("../config/db");
const { requireAuth, requireRole, optionalAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { asyncHandler } = require("../middleware/errorHandler");
const env = require("../config/env");
const { gregorianYearToEthiopianYear } = require("../utils/ethiopianDate");

const router = express.Router();

const RESOURCE_TYPES = ["book", "thesis", "journal", "module", "exam", "reference"];
const LANGUAGES = ["en", "am", "or", "ti", "other"];
const SORTS = {
  newest: "r.created_at DESC",
  oldest: "r.created_at ASC",
  title: "r.title ASC",
  author: "r.author ASC",
  popular: "(r.download_count + r.view_count) DESC",
  year: "r.publication_year DESC",
};

const SELECT_RESOURCE = `
  SELECT r.*, c.name_en AS college_name, c.name_am AS college_name_am,
         d.name_en AS department_name, d.name_am AS department_name_am,
         u.full_name AS uploaded_by_name
    FROM resources r
    LEFT JOIN colleges c ON c.id = r.college_id
    LEFT JOIN departments d ON d.id = r.department_id
    LEFT JOIN users u ON u.id = r.uploaded_by`;

const toInt = (value, fallback = null) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

function buildFilters(q) {
  const where = ["r.is_deleted = 0"];
  const params = [];

  if (q.q) {
    const term = `%${q.q}%`;
    where.push(
      "(r.title LIKE ? OR r.title_am LIKE ? OR r.author LIKE ? OR r.subject LIKE ? OR r.keywords LIKE ? OR r.isbn LIKE ?)",
    );
    params.push(term, term, term, term, term, term);
  }
  if (q.type && RESOURCE_TYPES.includes(q.type)) {
    where.push("r.resource_type = ?");
    params.push(q.type);
  }
  if (q.language && LANGUAGES.includes(q.language)) {
    where.push("r.language = ?");
    params.push(q.language);
  }
  if (toInt(q.college_id) !== null) {
    where.push("r.college_id = ?");
    params.push(toInt(q.college_id));
  }
  if (toInt(q.department_id) !== null) {
    where.push("r.department_id = ?");
    params.push(toInt(q.department_id));
  }
  if (toInt(q.year_from) !== null) {
    where.push("r.publication_year >= ?");
    params.push(toInt(q.year_from));
  }
  if (toInt(q.year_to) !== null) {
    where.push("r.publication_year <= ?");
    params.push(toInt(q.year_to));
  }
  if (q.available === "true") {
    where.push("r.available_copies > 0");
  }
  if (q.digital === "true") {
    where.push("r.file_path IS NOT NULL");
  }
  return { where: `WHERE ${where.join(" AND ")}`, params };
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { where, params } = buildFilters(req.query);
    const page = Math.max(1, toInt(req.query.page, 1));
    const perPage = Math.min(60, Math.max(1, toInt(req.query.per_page, 12)));
    const offset = (page - 1) * perPage;
    const orderBy = SORTS[req.query.sort] || SORTS.newest;

    const rows = await query(
      `${SELECT_RESOURCE} ${where} ORDER BY ${orderBy} LIMIT ${perPage} OFFSET ${offset}`,
      params,
    );
    const { total } = await queryOne(
      `SELECT COUNT(*) AS total FROM resources r ${where}`,
      params,
    );

    res.json({
      resources: rows,
      pagination: {
        page,
        per_page: perPage,
        total,
        pages: Math.max(1, Math.ceil(total / perPage)),
      },
    });
  }),
);

router.get(
  "/facets",
  asyncHandler(async (_req, res) => {
    const [types, languages, years] = await Promise.all([
      query(
        "SELECT resource_type, COUNT(*) AS count FROM resources WHERE is_deleted = 0 GROUP BY resource_type",
      ),
      query(
        "SELECT language, COUNT(*) AS count FROM resources WHERE is_deleted = 0 GROUP BY language",
      ),
      query(
        "SELECT MIN(publication_year) AS min_year, MAX(publication_year) AS max_year FROM resources WHERE is_deleted = 0",
      ),
    ]);
    res.json({ types, languages, years: years[0] });
  }),
);

router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const resource = await queryOne(`${SELECT_RESOURCE} WHERE r.id = ? AND r.is_deleted = 0`, [
      toInt(req.params.id, 0),
    ]);
    if (!resource) return res.status(404).json({ error: "Resource not found" });

    await query("UPDATE resources SET view_count = view_count + 1 WHERE id = ?", [
      resource.id,
    ]);

    const related = await query(
      `${SELECT_RESOURCE}
        WHERE r.is_deleted = 0 AND r.id <> ?
          AND (r.department_id = ? OR r.subject = ?)
        ORDER BY r.created_at DESC LIMIT 4`,
      [resource.id, resource.department_id, resource.subject],
    );

    let activeLoan = null;
    if (req.user) {
      activeLoan = await queryOne(
        "SELECT * FROM loans WHERE user_id = ? AND resource_id = ? AND returned_at IS NULL",
        [req.user.id, resource.id],
      );
    }
    res.json({ resource, related, active_loan: activeLoan });
  }),
);

function resourcePayload(body, file) {
  const year = toInt(body.publication_year);
  return {
    title: body.title,
    title_am: body.title_am || null,
    author: body.author,
    publisher: body.publisher || null,
    publication_year: year,
    publication_year_ec: year === null ? null : gregorianYearToEthiopianYear(year),
    isbn: body.isbn || null,
    language: LANGUAGES.includes(body.language) ? body.language : "en",
    resource_type: RESOURCE_TYPES.includes(body.resource_type)
      ? body.resource_type
      : "book",
    college_id: toInt(body.college_id),
    department_id: toInt(body.department_id),
    subject: body.subject || null,
    abstract: body.abstract || null,
    keywords: body.keywords || null,
    edition: body.edition || null,
    pages: toInt(body.pages),
    cover_url: body.cover_url || null,
    shelf_location: body.shelf_location || null,
    total_copies: Math.max(0, toInt(body.total_copies, 1)),
    file_path: file ? file.filename : undefined,
    file_size: file ? file.size : undefined,
  };
}

router.post(
  "/",
  requireAuth,
  requireRole("librarian", "admin"),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const data = resourcePayload(req.body, req.file);
    if (!data.title || !data.author) {
      return res.status(400).json({ error: "Title and author are required" });
    }
    const result = await query(
      `INSERT INTO resources
        (title, title_am, author, publisher, publication_year, publication_year_ec, isbn,
         language, resource_type, college_id, department_id, subject, abstract, keywords,
         edition, pages, cover_url, shelf_location, total_copies, available_copies,
         file_path, file_size, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.title_am,
        data.author,
        data.publisher,
        data.publication_year,
        data.publication_year_ec,
        data.isbn,
        data.language,
        data.resource_type,
        data.college_id,
        data.department_id,
        data.subject,
        data.abstract,
        data.keywords,
        data.edition,
        data.pages,
        data.cover_url,
        data.shelf_location,
        data.total_copies,
        data.total_copies,
        data.file_path || null,
        data.file_size || null,
        req.user.id,
      ],
    );
    const resource = await queryOne(`${SELECT_RESOURCE} WHERE r.id = ?`, [
      result.insertId,
    ]);
    res.status(201).json({ message: "Resource added", resource });
  }),
);

router.put(
  "/:id",
  requireAuth,
  requireRole("librarian", "admin"),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const id = toInt(req.params.id, 0);
    const existing = await queryOne(
      "SELECT * FROM resources WHERE id = ? AND is_deleted = 0",
      [id],
    );
    if (!existing) return res.status(404).json({ error: "Resource not found" });

    const data = resourcePayload(req.body, req.file);
    // Only touch the columns the client actually sent.
    const fields = Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) => value !== undefined && key in req.body,
      ),
    );
    if (req.body.publication_year !== undefined) {
      fields.publication_year_ec = data.publication_year_ec;
    }
    if (req.file) {
      fields.file_path = data.file_path;
      fields.file_size = data.file_size;
    }
    if (req.body.total_copies !== undefined) {
      const borrowed = existing.total_copies - existing.available_copies;
      fields.available_copies = Math.max(0, data.total_copies - borrowed);
    }
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const assignments = Object.keys(fields).map((key) => `${key} = ?`);
    await query(`UPDATE resources SET ${assignments.join(", ")} WHERE id = ?`, [
      ...Object.values(fields),
      id,
    ]);

    const resource = await queryOne(`${SELECT_RESOURCE} WHERE r.id = ?`, [id]);
    res.json({ message: "Resource updated", resource });
  }),
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("librarian", "admin"),
  asyncHandler(async (req, res) => {
    const id = toInt(req.params.id, 0);
    const open = await queryOne(
      "SELECT COUNT(*) AS count FROM loans WHERE resource_id = ? AND returned_at IS NULL",
      [id],
    );
    if (open.count > 0) {
      return res
        .status(409)
        .json({ error: "This resource is still borrowed by someone" });
    }
    await query("UPDATE resources SET is_deleted = 1 WHERE id = ?", [id]);
    res.json({ message: "Resource removed" });
  }),
);

router.get(
  "/:id/file",
  asyncHandler(async (req, res) => {
    const resource = await queryOne(
      "SELECT * FROM resources WHERE id = ? AND is_deleted = 0",
      [toInt(req.params.id, 0)],
    );
    if (!resource || !resource.file_path) {
      return res.status(404).json({ error: "No digital copy for this resource" });
    }
    const filePath = path.join(env.uploadDir, resource.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "The file is missing on the server" });
    }
    await query("UPDATE resources SET download_count = download_count + 1 WHERE id = ?", [
      resource.id,
    ]);
    res.setHeader("Content-Disposition", `inline; filename="${resource.file_path}"`);
    return res.sendFile(filePath);
  }),
);

module.exports = { router };

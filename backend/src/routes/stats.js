const express = require("express");
const { query, queryOne } = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const totals = await queryOne(
      `SELECT
         (SELECT COUNT(*) FROM resources WHERE is_deleted = 0) AS resources,
         (SELECT COUNT(*) FROM resources WHERE is_deleted = 0 AND file_path IS NOT NULL) AS digital_copies,
         (SELECT COUNT(*) FROM resources WHERE is_deleted = 0 AND resource_type = 'thesis') AS theses,
         (SELECT COUNT(*) FROM colleges) AS colleges,
         (SELECT COUNT(*) FROM departments) AS departments`,
    );
    const popular = await query(
      `SELECT id, title, title_am, author, cover_url, resource_type,
              (download_count + view_count) AS popularity
         FROM resources WHERE is_deleted = 0
        ORDER BY popularity DESC, created_at DESC LIMIT 6`,
    );
    const latest = await query(
      `SELECT id, title, title_am, author, cover_url, resource_type, created_at
         FROM resources WHERE is_deleted = 0
        ORDER BY created_at DESC LIMIT 6`,
    );
    res.json({ totals, popular, latest });
  }),
);

router.get(
  "/admin",
  requireAuth,
  requireRole("librarian", "admin"),
  asyncHandler(async (_req, res) => {
    const totals = await queryOne(
      `SELECT
         (SELECT COUNT(*) FROM users) AS users,
         (SELECT COUNT(*) FROM resources WHERE is_deleted = 0) AS resources,
         (SELECT COUNT(*) FROM loans WHERE returned_at IS NULL) AS active_loans,
         (SELECT COUNT(*) FROM loans WHERE returned_at IS NULL AND due_at < NOW()) AS overdue_loans,
         (SELECT COALESCE(SUM(fine_amount), 0) FROM loans) AS collected_fines`,
    );
    const byType = await query(
      `SELECT resource_type, COUNT(*) AS count FROM resources
        WHERE is_deleted = 0 GROUP BY resource_type ORDER BY count DESC`,
    );
    const byCollege = await query(
      `SELECT c.name_en AS college, COUNT(r.id) AS count
         FROM colleges c LEFT JOIN resources r ON r.college_id = c.id AND r.is_deleted = 0
        GROUP BY c.id ORDER BY count DESC`,
    );
    res.json({ totals, by_type: byType, by_college: byCollege });
  }),
);

router.get(
  "/users",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const users = await query(
      `SELECT u.id, u.full_name, u.email, u.role, u.university_id, u.is_verified,
              u.created_at, d.name_en AS department_name,
              (SELECT COUNT(*) FROM loans l WHERE l.user_id = u.id AND l.returned_at IS NULL) AS active_loans
         FROM users u LEFT JOIN departments d ON d.id = u.department_id
        ORDER BY u.created_at DESC LIMIT 200`,
    );
    res.json({ users });
  }),
);

router.put(
  "/users/:id/role",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const roles = ["student", "instructor", "librarian", "admin"];
    if (!roles.includes(req.body.role)) {
      return res.status(400).json({ error: "Unknown role" });
    }
    await query("UPDATE users SET role = ? WHERE id = ?", [
      req.body.role,
      Number.parseInt(req.params.id, 10),
    ]);
    return res.json({ message: "Role updated" });
  }),
);

module.exports = { router };

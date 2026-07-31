const express = require("express");
const { pool, query, queryOne } = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const env = require("../config/env");
const { formatEthiopian } = require("../utils/ethiopianDate");

const router = express.Router();

const SELECT_LOAN = `
  SELECT l.*, r.title, r.title_am, r.author, r.cover_url, r.resource_type,
         u.full_name AS borrower_name, u.email AS borrower_email,
         u.university_id AS borrower_university_id
    FROM loans l
    JOIN resources r ON r.id = l.resource_id
    JOIN users u ON u.id = l.user_id`;

// A loan accrues a fine for every day it stays out past the due date.
function decorate(loan) {
  const now = new Date();
  const due = new Date(loan.due_at.replace(" ", "T"));
  const end = loan.returned_at ? new Date(loan.returned_at.replace(" ", "T")) : now;
  const overdueDays = Math.max(0, Math.floor((end - due) / 86400000));
  return {
    ...loan,
    status: loan.returned_at ? "returned" : overdueDays > 0 ? "overdue" : "active",
    overdue_days: loan.returned_at ? 0 : overdueDays,
    fine_amount: loan.returned_at
      ? Number(loan.fine_amount)
      : overdueDays * env.loan.finePerDayEtb,
    due_at_ec: formatEthiopian(loan.due_at),
    borrowed_at_ec: formatEthiopian(loan.borrowed_at),
  };
}

router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const loans = await query(
      `${SELECT_LOAN} WHERE l.user_id = ? ORDER BY l.returned_at IS NOT NULL, l.due_at`,
      [req.user.id],
    );
    res.json({ loans: loans.map(decorate) });
  }),
);

router.get(
  "/",
  requireAuth,
  requireRole("librarian", "admin"),
  asyncHandler(async (req, res) => {
    const filters = [];
    if (req.query.status === "active") filters.push("l.returned_at IS NULL");
    if (req.query.status === "overdue") {
      filters.push("l.returned_at IS NULL AND l.due_at < NOW()");
    }
    if (req.query.status === "returned") filters.push("l.returned_at IS NOT NULL");
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const loans = await query(`${SELECT_LOAN} ${where} ORDER BY l.due_at DESC LIMIT 200`);
    res.json({ loans: loans.map(decorate) });
  }),
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const resourceId = Number.parseInt(req.body.resource_id, 10);
    if (Number.isNaN(resourceId)) {
      return res.status(400).json({ error: "resource_id is required" });
    }

    const maxLoans = env.loan.maxByRole[req.user.role] || 3;
    const loanDays = env.loan.daysByRole[req.user.role] || 14;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [[resource]] = await connection.execute(
        "SELECT * FROM resources WHERE id = ? AND is_deleted = 0 FOR UPDATE",
        [resourceId],
      );
      if (!resource) {
        await connection.rollback();
        return res.status(404).json({ error: "Resource not found" });
      }
      if (resource.available_copies < 1) {
        await connection.rollback();
        return res.status(409).json({ error: "No copy is available right now" });
      }

      const [[open]] = await connection.execute(
        "SELECT COUNT(*) AS count FROM loans WHERE user_id = ? AND returned_at IS NULL",
        [req.user.id],
      );
      if (open.count >= maxLoans) {
        await connection.rollback();
        return res
          .status(409)
          .json({ error: `You can borrow at most ${maxLoans} items at a time` });
      }

      const [[duplicate]] = await connection.execute(
        "SELECT id FROM loans WHERE user_id = ? AND resource_id = ? AND returned_at IS NULL",
        [req.user.id, resourceId],
      );
      if (duplicate) {
        await connection.rollback();
        return res.status(409).json({ error: "You already borrowed this item" });
      }

      const [result] = await connection.execute(
        "INSERT INTO loans (user_id, resource_id, due_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))",
        [req.user.id, resourceId, loanDays],
      );
      await connection.execute(
        "UPDATE resources SET available_copies = available_copies - 1 WHERE id = ?",
        [resourceId],
      );
      await connection.commit();

      const loan = await queryOne(`${SELECT_LOAN} WHERE l.id = ?`, [result.insertId]);
      return res.status(201).json({ message: "Borrowed", loan: decorate(loan) });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }),
);

router.post(
  "/:id/return",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    const loan = await queryOne("SELECT * FROM loans WHERE id = ?", [id]);
    if (!loan) return res.status(404).json({ error: "Loan not found" });

    const isStaff = ["librarian", "admin"].includes(req.user.role);
    if (loan.user_id !== req.user.id && !isStaff) {
      return res.status(403).json({ error: "You are not allowed to do this" });
    }
    if (loan.returned_at) {
      return res.status(409).json({ error: "This item was already returned" });
    }

    const { fine_amount: fineAmount } = decorate(loan);
    await query("UPDATE loans SET returned_at = NOW(), fine_amount = ? WHERE id = ?", [
      fineAmount,
      id,
    ]);
    await query(
      "UPDATE resources SET available_copies = LEAST(total_copies, available_copies + 1) WHERE id = ?",
      [loan.resource_id],
    );

    const updated = await queryOne(`${SELECT_LOAN} WHERE l.id = ?`, [id]);
    res.json({ message: "Returned", loan: decorate(updated) });
  }),
);

module.exports = { router };

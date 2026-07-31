const express = require("express");
const { query } = require("../config/db");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get(
  "/colleges",
  asyncHandler(async (_req, res) => {
    const colleges = await query(
      `SELECT c.*, COUNT(DISTINCT d.id) AS department_count,
              COUNT(DISTINCT r.id) AS resource_count
         FROM colleges c
         LEFT JOIN departments d ON d.college_id = c.id
         LEFT JOIN resources r ON r.college_id = c.id AND r.is_deleted = 0
        GROUP BY c.id
        ORDER BY c.name_en`,
    );
    res.json({ colleges });
  }),
);

router.get(
  "/departments",
  asyncHandler(async (req, res) => {
    const { college_id } = req.query;
    const params = [];
    let where = "";
    if (college_id) {
      where = "WHERE d.college_id = ?";
      params.push(Number(college_id));
    }
    const departments = await query(
      `SELECT d.*, c.name_en AS college_name, c.name_am AS college_name_am,
              COUNT(r.id) AS resource_count
         FROM departments d
         JOIN colleges c ON c.id = d.college_id
         LEFT JOIN resources r ON r.department_id = d.id AND r.is_deleted = 0
         ${where}
        GROUP BY d.id
        ORDER BY d.name_en`,
      params,
    );
    res.json({ departments });
  }),
);

module.exports = { router };

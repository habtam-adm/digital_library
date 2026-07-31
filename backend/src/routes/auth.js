const express = require("express");
const bcrypt = require("bcryptjs");
const { query, queryOne } = require("../config/db");
const { signToken, requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PUBLIC_ROLES = ["student", "instructor"];

const publicUser = (row) => ({
  id: row.id,
  full_name: row.full_name,
  email: row.email,
  role: row.role,
  university_id: row.university_id,
  department_id: row.department_id,
  department_name: row.department_name || null,
  phone: row.phone,
  is_verified: Boolean(row.is_verified),
});

const sixDigitCode = () => String(Math.floor(100000 + Math.random() * 900000));

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { full_name, email, password, university_id, department_id, phone, role } =
      req.body;

    if (!full_name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Full name, email and password are required" });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Enter a valid email address" });
    }
    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const existing = await queryOne("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) {
      return res.status(409).json({ error: "This email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = sixDigitCode();
    const result = await query(
      `INSERT INTO users
         (full_name, email, password_hash, role, university_id, department_id, phone, verification_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        email,
        passwordHash,
        PUBLIC_ROLES.includes(role) ? role : "student",
        university_id || null,
        department_id || null,
        phone || null,
        verificationCode,
      ],
    );

    const user = await queryOne("SELECT * FROM users WHERE id = ?", [result.insertId]);
    return res.status(201).json({
      message: "Account created. Verify your email to continue.",
      user: publicUser(user),
      // No mail server is configured yet, so the code is returned directly.
      verification_code: verificationCode,
    });
  }),
);

router.post(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }
    const user = await queryOne("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(404).json({ error: "Account not found" });
    if (user.is_verified) {
      return res.json({ message: "This account is already verified" });
    }
    if (user.verification_code !== String(code)) {
      return res.status(400).json({ error: "The code you entered is not correct" });
    }
    await query(
      "UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?",
      [user.id],
    );
    return res.json({ message: "Email verified. You can log in now." });
  }),
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await queryOne(
      `SELECT u.*, d.name_en AS department_name
         FROM users u
         LEFT JOIN departments d ON d.id = u.department_id
        WHERE u.email = ?`,
      [email],
    );
    if (!user) return res.status(401).json({ error: "Wrong email or password" });

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) return res.status(401).json({ error: "Wrong email or password" });

    return res.json({
      message: "Welcome back",
      token: signToken(user),
      user: publicUser(user),
    });
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await queryOne(
      `SELECT u.*, d.name_en AS department_name
         FROM users u
         LEFT JOIN departments d ON d.id = u.department_id
        WHERE u.id = ?`,
      [req.user.id],
    );
    if (!user) return res.status(404).json({ error: "Account not found" });
    return res.json({ user: publicUser(user) });
  }),
);

router.post(
  "/request-reset",
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user = await queryOne("SELECT id FROM users WHERE email = ?", [email]);
    if (!user) return res.status(404).json({ error: "Account not found" });

    const code = sixDigitCode();
    await query(
      "UPDATE users SET reset_code = ?, reset_expires_at = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?",
      [code, user.id],
    );
    return res.json({ message: "A reset code was generated.", reset_code: code });
  }),
);

router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const { email, code, new_password } = req.body;
    if (!email || !code || !new_password) {
      return res
        .status(400)
        .json({ error: "Email, code and new password are required" });
    }
    if (String(new_password).length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }
    const user = await queryOne(
      "SELECT * FROM users WHERE email = ? AND reset_code = ? AND reset_expires_at > NOW()",
      [email, String(code)],
    );
    if (!user) {
      return res.status(400).json({ error: "The reset code is wrong or expired" });
    }
    const passwordHash = await bcrypt.hash(new_password, 10);
    await query(
      "UPDATE users SET password_hash = ?, reset_code = NULL, reset_expires_at = NULL WHERE id = ?",
      [passwordHash, user.id],
    );
    return res.json({ message: "Password updated. You can log in now." });
  }),
);

module.exports = { router, publicUser };

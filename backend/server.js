const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// =====================
// SIGNUP
// =====================
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "Email already exists." });
        }
        console.error(err);
        return res.status(500).json({ error: "Database error." });
      }
      res
        .status(201)
        .json({ message: "Account created. Please verify email." });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// =====================
// LOGIN
// =====================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      // Never send password back
      const { password, ...userData } = user;
      return res.json({ message: "Login success", user: userData });
    } else {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  });
});

// =====================
// EMAIL VERIFICATION (stub)
// =====================
app.post("/api/verify-email", (req, res) => {
  const { email, code } = req.body;
  // In a real app, compare the code against a stored one.
  // For now, assume verification always works.
  res.json({ message: "Email verified successfully!" });
});

// =====================
// FORGOT PASSWORD - request reset code (stub)
// =====================
app.post("/api/request-reset", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  // Check if user exists
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0)
      return res.status(404).json({ error: "Email not found" });

    // TODO: generate a reset code, store it, send email
    res.json({ message: "Verification code sent to your email." });
  });
});

// =====================
// FORGOT PASSWORD - reset password (stub)
// =====================
app.post("/api/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // TODO: verify the code from DB/token
  // For this stub, just update the password directly (unsecure in production!)
  const hashed = await bcrypt.hash(newPassword, 10);
  db.query(
    "UPDATE users SET password = ? WHERE email = ?",
    [hashed, email],
    (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Password reset successful!" });
    },
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

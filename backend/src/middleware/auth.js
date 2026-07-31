const jwt = require("jsonwebtoken");
const env = require("../config/env");

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

function readToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, env.jwtSecret);
    } catch (err) {
      req.user = null;
    }
  }
  next();
}

function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You are not allowed to do this" });
    }
    return next();
  };
}

module.exports = { signToken, optionalAuth, requireAuth, requireRole };

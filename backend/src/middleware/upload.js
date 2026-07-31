const fs = require("fs");
const path = require("path");
const multer = require("multer");
const env = require("../config/env");

fs.mkdirSync(env.uploadDir, { recursive: true });

const ALLOWED = new Set([
  "application/pdf",
  "application/epub+zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 60);
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(new Error("Only PDF, EPUB and Word documents are allowed"));
    }
    return cb(null, true);
  },
});

module.exports = { upload };

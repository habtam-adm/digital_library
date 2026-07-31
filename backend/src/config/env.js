const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const env = {
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "wku-digital-library-dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  uploadDir: path.resolve(
    __dirname,
    "..",
    "..",
    process.env.UPLOAD_DIR || "uploads",
  ),
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 50),
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "library_db",
  },
  // OAI-PMH repository identity (used by national/EthERNet harvesters)
  oai: {
    repositoryName:
      process.env.OAI_REPOSITORY_NAME ||
      "Wolkite University Institutional Repository",
    baseUrl: process.env.OAI_BASE_URL || "http://localhost:5000/oai",
    adminEmail: process.env.OAI_ADMIN_EMAIL || "library@wku.edu.et",
  },
  loan: {
    // Circulation policy of the university library
    daysByRole: { student: 14, instructor: 30, librarian: 30, admin: 30 },
    maxByRole: { student: 3, instructor: 5, librarian: 5, admin: 5 },
    finePerDayEtb: Number(process.env.FINE_PER_DAY_ETB || 5),
  },
};

module.exports = env;

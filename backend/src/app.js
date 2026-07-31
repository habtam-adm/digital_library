const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const auth = require("./routes/auth");
const catalog = require("./routes/colleges");
const resources = require("./routes/resources");
const loans = require("./routes/loans");
const stats = require("./routes/stats");
const oai = require("./routes/oai");

const app = express();

app.use(cors({ origin: env.clientOrigin === "*" ? true : env.clientOrigin.split(",") }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", service: "wku-digital-library" }),
);

app.use("/api/auth", auth.router);
app.use("/api", catalog.router);
app.use("/api/resources", resources.router);
app.use("/api/loans", loans.router);
app.use("/api/stats", stats.router);
app.use("/oai", oai.router);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

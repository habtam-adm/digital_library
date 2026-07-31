const multer = require("multer");

function notFound(_req, res) {
  res.status(404).json({ error: "Endpoint not found" });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  const status = err.status || 500;
  return res.status(status).json({ error: err.message || "Server error" });
}

// Wraps an async route handler so rejections reach the error handler.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { notFound, errorHandler, asyncHandler };

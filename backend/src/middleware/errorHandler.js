const logger = require("../utils/logger");

module.exports = function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map(function(e) { return e.message; }).join(", ");
  }
  if (err.code === 11000) {
    status = 409;
    message = Object.keys(err.keyValue)[0] + " already exists";
  }
  if (err.name === "CastError") { status = 400; message = "Invalid " + err.path; }
  if (err.name === "JsonWebTokenError") { status = 401; message = "Invalid token"; }
  if (err.name === "TokenExpiredError") { status = 401; message = "Token expired"; }
  if (status >= 500) logger.error(status + " " + message + " " + req.originalUrl);

  res.status(status).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

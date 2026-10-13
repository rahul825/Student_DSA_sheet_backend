const AppError = require("../utils/AppError");
const env = require("../config/env");

function notFound(req, res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Map common MySQL errors to friendly HTTP errors.
  if (err.code === "ER_DUP_ENTRY") err = new AppError(409, "Record already exists");
  if (err.code === "ER_NO_REFERENCED_ROW_2") err = new AppError(400, "Referenced topic/problem does not exist");
  if (err.type === "entity.parse.failed") err = new AppError(400, "Invalid JSON body");

  const status = err.status || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    message: status >= 500 && env.nodeEnv === "production" ? "Internal server error" : err.message,
    ...(err.details && { details: err.details }),
  });
}

module.exports = { notFound, errorHandler };

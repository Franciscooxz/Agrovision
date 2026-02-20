const sendResponse = require("../utils/sendResponse");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = Boolean(err.isOperational);
  const isProduction = process.env.NODE_ENV === "production";

  if (!isOperational) {
    console.error(err);
  }

  const message = isOperational
    ? err.message
    : isProduction
      ? "Internal server error"
      : err.message;

  const data = !isProduction && err.stack
    ? { stack: err.stack }
    : null;

  return sendResponse(res, statusCode, false, message, data);
};

module.exports = errorHandler;

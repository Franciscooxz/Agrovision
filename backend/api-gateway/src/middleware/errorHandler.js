const sendResponse = require("../utils/sendResponse");

const errorHandler = (err, req, res, next) => {
  let normalizedError = err;

  if (err.name === "CastError") {
    normalizedError = {
      ...err,
      statusCode: 400,
      isOperational: true,
      message: `Invalid value for field: ${err.path}`,
    };
  }

  if (err.name === "ValidationError") {
    const firstValidationError = Object.values(err.errors || {})[0];
    normalizedError = {
      ...err,
      statusCode: 400,
      isOperational: true,
      message: firstValidationError?.message || "Validation error",
    };
  }

  if (err.code === 11000) {
    normalizedError = {
      ...err,
      statusCode: 409,
      isOperational: true,
      message: "Duplicate value error",
    };
  }

  const statusCode = normalizedError.statusCode || 500;
  const isOperational = Boolean(normalizedError.isOperational);
  const isProduction = process.env.NODE_ENV === "production";

  if (!isOperational) {
    console.error(normalizedError);
  }

  const message = isOperational
    ? normalizedError.message
    : isProduction
      ? "Internal server error"
      : normalizedError.message;

  const data = !isProduction && normalizedError.stack
    ? { stack: normalizedError.stack }
    : null;

  return sendResponse(res, statusCode, false, message, data);
};

module.exports = errorHandler;

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

// ===============================
// PROTECT - Verifica JWT
// ===============================
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError("No autorizado. Token no encontrado.", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(new AppError("Token inválido o expirado", 401));
  }

  req.user = await User.findById(decoded.id).select("-password");

  if (!req.user) {
    return next(new AppError("Usuario no encontrado", 401));
  }

  return next();
});

// ===============================
// AUTHORIZE - Verificar roles
// ===============================
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("No tienes permisos para esta acción", 403));
    }

    return next();
  };
};

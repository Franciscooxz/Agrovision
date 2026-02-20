const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendResponse = require("../utils/sendResponse");

// ===============================
// PROTECT - Verifica JWT
// ===============================
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Leer token desde cookie
    if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendResponse(res, 401, false, "No autorizado. Token no encontrado.");
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener usuario sin password
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return sendResponse(res, 401, false, "Usuario no encontrado");
    }

    next();

  } catch (error) {
    return sendResponse(res, 401, false, "Token inválido o expirado");
  }
};

// ===============================
// AUTHORIZE - Verificar roles
// ===============================
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendResponse(res, 403, false, "No tienes permisos para esta acción");
    }
    next();
  };
};

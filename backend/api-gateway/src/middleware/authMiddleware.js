const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
      return res.status(401).json({
        message: "No autorizado. Token no encontrado.",
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener usuario sin password
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        message: "Usuario no encontrado",
      });
    }

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
};

// ===============================
// AUTHORIZE - Verificar roles
// ===============================
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "No tienes permisos para esta acción",
      });
    }
    next();
  };
};

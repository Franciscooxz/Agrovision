const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendResponse = require('../utils/sendResponse');

// PROTECT - Verifica JWT (cookie o Bearer header)
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendResponse(res, 401, false, 'No autorizado. Token no encontrado.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!req.user) {
      return sendResponse(res, 401, false, 'Usuario no encontrado');
    }

    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Token inválido o expirado');
  }
};

// AUTHORIZE - Verificar roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendResponse(res, 403, false, 'No tienes permisos para esta acción');
    }
    next();
  };
};

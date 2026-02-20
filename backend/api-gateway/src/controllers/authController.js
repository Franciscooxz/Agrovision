const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendResponse = require("../utils/sendResponse");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

// GENERAR TOKEN
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ===============================
// REGISTER
// ===============================
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new AppError("Todos los campos son obligatorios", 400));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError("El usuario ya existe", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "user",
  });

  return sendResponse(res, 201, true, "Usuario registrado correctamente", {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

// ===============================
// LOGIN
// ===============================
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("Credenciales inválidas", 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new AppError("Credenciales inválidas", 401));
  }

  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendResponse(res, 200, true, "Login exitoso", {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// ===============================
// LOGOUT
// ===============================
exports.logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return sendResponse(res, 200, true, "Sesión cerrada correctamente");
};

// ===============================
// GET USER PROFILE
// ===============================
exports.getMe = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, true, "Perfil obtenido correctamente", req.user);
});

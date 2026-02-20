const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendResponse = require("../utils/sendResponse");

// GENERAR TOKEN
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ===============================
// REGISTER
// ===============================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validaciones básicas
    if (!name || !email || !password) {
      return sendResponse(res, 400, false, "Todos los campos son obligatorios");
    }

    // Verificar si ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendResponse(res, 400, false, "El usuario ya existe");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
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

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// ===============================
// LOGIN
// ===============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email });

    if (!user) {
      return sendResponse(res, 401, false, "Credenciales inválidas");
    }

    // Comparar password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return sendResponse(res, 401, false, "Credenciales inválidas");
    }

    // Generar token
    const token = generateToken(user._id);

    // Enviar cookie segura
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // poner true en producción con HTTPS
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

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

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
  exports.getMe = async (req, res) => {
    return sendResponse(res, 200, true, "Perfil obtenido correctamente", req.user);
  };

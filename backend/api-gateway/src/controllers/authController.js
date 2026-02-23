const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/sendResponse');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (id) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  // Use COOKIE_SECURE=true only when serving over HTTPS (not needed for HTTP Docker dev)
  const isSecure = process.env.COOKIE_SECURE === 'true';
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendResponse(res, 400, false, 'Todos los campos son obligatorios');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendResponse(res, 400, false, 'El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Primer usuario se convierte en admin automáticamente
    const userCount = await User.countDocuments();
    const assignedRole = userCount === 0 ? 'admin' : 'farmer';

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
    });

    return sendResponse(res, 201, true, 'Usuario registrado correctamente', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 401, false, 'Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, 401, false, 'Credenciales inválidas');
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);

    return sendResponse(res, 200, true, 'Login exitoso', {
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return sendResponse(res, 401, false, 'Refresh token no encontrado');
    }

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return sendResponse(res, 401, false, 'Refresh token inválido');
    }

    const newAccessToken = generateAccessToken(user._id);
    setTokenCookies(res, newAccessToken, null);

    return sendResponse(res, 200, true, 'Token renovado', {
      token: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (error) {
    return sendResponse(res, 401, false, 'Refresh token inválido o expirado');
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
    }
  } catch {}

  const isSecure = process.env.COOKIE_SECURE === 'true';
  res.cookie('token', '', { httpOnly: true, secure: isSecure, sameSite: 'lax', expires: new Date(0) });
  res.cookie('refreshToken', '', { httpOnly: true, secure: isSecure, sameSite: 'lax', expires: new Date(0) });
  return sendResponse(res, 200, true, 'Sesión cerrada correctamente');
};

// GET ME
exports.getMe = async (req, res) => {
  return sendResponse(res, 200, true, 'Usuario obtenido', req.user);
};

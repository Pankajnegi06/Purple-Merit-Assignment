const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate access token (short-lived)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Generate refresh token (long-lived)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// Set refresh token cookie
const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Account is deactivated. Contact an administrator.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    res.json({
      message: 'Login successful',
      accessToken,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh-token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'No refresh token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.status === 'inactive') {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    setRefreshCookie(res, newRefreshToken);

    res.json({ accessToken, user: user.toJSON() });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token.' });
  }
};

/**
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0),
  });
  res.json({ message: 'Logged out successfully.' });
};

/**
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

const jwt = require('jsonwebtoken');
const User = require('../models/User');

function success(res, message, data) {
  return res.json({ success: true, message, data });
}

function validationError(res, message, errors) {
  return res.status(400).json({ success: false, message, errors });
}

function unauthorized(res, message) {
  return res.status(401).json({ success: false, message });
}

function serverError(res, message) {
  return res.status(500).json({ success: false, message });
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return validationError(res, 'Validation error', { email: 'Email and password are required' });

    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password').exec();
    if (!user) return unauthorized(res, 'Invalid credentials');
    if (user.isDeleted) return unauthorized(res, 'Invalid credentials');
    if (user.status !== 'active') return unauthorized(res, 'User is not active');

    const match = await user.comparePassword(password);
    if (!match) return unauthorized(res, 'Invalid credentials');

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    return success(res, 'Login successful', { token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    return serverError(res, 'Server error');
  }
};

exports.me = async (req, res) => {
  try {
    if (!req.user) return unauthorized(res, 'Unauthorized');
    const user = req.user;
    return success(res, 'User retrieved', { id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    return serverError(res, 'Server error');
  }
};

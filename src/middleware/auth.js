const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Missing token' });
    const token = auth.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Missing token' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = await User.findOne({ _id: payload.id }).exec();
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token user' });
    if (user.isDeleted) return res.status(401).json({ success: false, message: 'User deleted' });
    if (user.status !== 'active') return res.status(401).json({ success: false, message: 'User inactive' });

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

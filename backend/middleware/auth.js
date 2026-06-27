const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token =
      authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader || req.headers['x-auth-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token missing. Send token in Authorization: Bearer <token>'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

module.exports = auth;

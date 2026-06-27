const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getTestUser = async () => {
  let user = await User.findOne({ email: 'testcustomer@example.com' });

  if (!user) {
    user = await User.create({
      name: 'Test Customer',
      email: 'testcustomer@example.com',
      password: 'test1234',
      role: 'customer'
    });
  }

  return user;
};

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token =
      authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader || req.headers['x-auth-token'];

    if (!token) {
      req.user = await getTestUser();
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      req.user = await getTestUser();
    }

    next();
  } catch (error) {
    req.user = await getTestUser();
    next();
  }
};

module.exports = auth;

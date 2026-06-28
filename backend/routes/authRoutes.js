const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../services/emailService');

const router = express.Router();

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
};

const createRefreshToken = async (user) => {
  const refreshToken = crypto.randomBytes(64).toString('hex');

  user.refreshToken = refreshToken;
  user.refreshExpire = Date.now() + Number(process.env.JWT_REFRESH_EXPIRES_MS || 604800000);
  await user.save();

  return refreshToken;
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, address, location } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const emailToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      role,
      address,
      location,
      emailToken,
      isVerified: false
    });

    const verifyUrl = `http://localhost:3000/api/auth/verify/${emailToken}`;

    await sendEmail(
      user.email,
      'Verify Email',
      `
        <h2>Verify Account</h2>
        <p>Click the link below to verify your account.</p>
        <a href="${verifyUrl}">Verify</a>
      `
    );

    res.status(201).json({
      success: true,
      message: 'Check email to verify'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      emailToken: req.params.token
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }

    user.isVerified = true;
    user.emailToken = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Verify email first'
      });
    }

    const refreshToken = await createRefreshToken(user);

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const user = await User.findOne({
      refreshToken,
      refreshExpire: {
        $gt: Date.now()
      }
    }).select('+refreshToken +refreshExpire');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    const newRefreshToken = await createRefreshToken(user);

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/logout', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      refreshToken: null,
      refreshExpire: null
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/forgot', async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');

    user.resetToken = token;
    user.resetExpire = Date.now() + 3600000;

    await user.save();

    const resetUrl = `http://localhost:3000/reset/${token}`;

    await sendEmail(
      user.email,
      'Reset Password',
      `
        <h2>Reset Password</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}">Reset Password</a>
      `
    );

    res.status(200).json({
      success: true,
      message: 'Reset email sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/reset/:token', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const user = await User.findOne({
      resetToken: req.params.token,
      resetExpire: {
        $gt: Date.now()
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token expired'
      });
    }

    user.password = password;
    user.resetToken = null;
    user.resetExpire = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/me', auth, async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../services/emailService');

const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: Number(process.env.JWT_COOKIE_EXPIRES_MS || 604800000)
};

const generateToken = (userOrId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  const payload = typeof userOrId === 'object'
    ? { id: userOrId._id, role: userOrId.role }
    : { id: userOrId };

  return jwt.sign(payload, process.env.JWT_SECRET, {
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

const isEmailConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, avatar, address, location } = req.body;

    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin users cannot be created from public registration'
      });
    }

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
      phone,
      avatar,
      address,
      location,
      emailToken,
      isVerified: isEmailConfigured() ? false : true
    });

    const verifyUrl = `http://localhost:3000/api/auth/verify/${emailToken}`;

    if (isEmailConfigured()) {
      await sendEmail(
        user.email,
        'Verify Email',
        `
          <h2>Verify Account</h2>
          <p>Click the link below to verify your account.</p>
          <a href="${verifyUrl}">Verify</a>
        `
      );
    } else {
      console.warn('EMAIL_USER and EMAIL_PASS are not set. Skipping verification email.');
    }

    res.status(201).json({
      success: true,
      message: isEmailConfigured() ? 'Check email to verify' : 'User registered successfully'
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

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    const token = generateToken(user);
    const refreshToken = await createRefreshToken(user);

    res.cookie('accessToken', token, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      token,
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

    const token = generateToken(user);
    const newRefreshToken = await createRefreshToken(user);

    res.cookie('accessToken', token, cookieOptions);
    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      token,
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

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

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

    const resetUrl = `http://localhost:3000/api/auth/reset/${token}`;

    if (isEmailConfigured()) {
      await sendEmail(
        user.email,
        'Reset Password',
        `
          <h2>Reset Password</h2>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}">Reset Password</a>
        `
      );
    } else {
      console.warn('EMAIL_USER and EMAIL_PASS are not set. Skipping reset email.');
    }

    res.status(200).json({
      success: true,
      message: isEmailConfigured() ? 'Reset email sent' : 'Password reset link generated',
      resetUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/reset', (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Reset token is required. Use POST /api/auth/forgot first, then call POST /api/auth/reset/:token with the token.'
  });
});

router.get('/reset/:token', (req, res) => {
  const token = req.params.token;

  res.type('html').send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Reset Password</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            font-family: Arial, sans-serif;
            background: #f4f6f8;
            color: #111827;
          }

          main {
            width: min(420px, calc(100vw - 32px));
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
          }

          h1 {
            margin: 0 0 16px;
            font-size: 22px;
          }

          label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 600;
          }

          input {
            box-sizing: border-box;
            width: 100%;
            height: 42px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 0 12px;
            font-size: 15px;
          }

          button {
            width: 100%;
            height: 42px;
            margin-top: 16px;
            border: 0;
            border-radius: 6px;
            background: #2563eb;
            color: white;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
          }

          p {
            min-height: 20px;
            margin: 14px 0 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>Reset Password</h1>
          <form id="reset-form">
            <label for="password">New password</label>
            <input id="password" name="password" type="password" minlength="6" required />
            <button type="submit">Update Password</button>
            <p id="message"></p>
          </form>
        </main>
        <script>
          const form = document.getElementById('reset-form');
          const message = document.getElementById('message');

          form.addEventListener('submit', async (event) => {
            event.preventDefault();
            message.textContent = 'Updating password...';

            const response = await fetch('/api/auth/reset/${token}', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password: form.password.value })
            });
            const data = await response.json();

            message.textContent = data.message || (data.success ? 'Password updated' : 'Unable to reset password');
            message.style.color = data.success ? '#047857' : '#b91c1c';
          });
        </script>
      </body>
    </html>
  `);
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
        message: 'Invalid or expired reset token. Generate a new reset link using POST /api/auth/forgot.'
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

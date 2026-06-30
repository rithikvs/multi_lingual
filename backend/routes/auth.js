const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { normalizePhoneNumber, isValidPhoneNumber } = require('../utils/phone');

// Helper to generate token
const getSignedToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'defaultlocal_sign_language_jwt_secret_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password, role, mobileNumber } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    const normalizedMobileNumber = mobileNumber ? normalizePhoneNumber(mobileNumber) : '';
    if (normalizedMobileNumber && !isValidPhoneNumber(normalizedMobileNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be in E.164 format, for example +919876543210.'
      });
    }

    // Create user
    user = await User.create({
      username,
      email,
      password,
      role: role || 'user',
      mobileNumber: normalizedMobileNumber || undefined
    });

    const token = getSignedToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, username: user.username, email: user.email, role: user.role, mobileNumber: user.mobileNumber } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = getSignedToken(user._id);
    res.status(200).json({ success: true, token, user: { id: user._id, username: user.username, email: user.email, role: user.role, mobileNumber: user.mobileNumber } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update user details
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const { username, email, mobileNumber } = req.body;

  try {
    const fieldsToUpdate = {};
    if (username) fieldsToUpdate.username = username;
    if (email) fieldsToUpdate.email = email;
    if (mobileNumber !== undefined) {
      const normalizedMobileNumber = normalizePhoneNumber(mobileNumber);
      if (normalizedMobileNumber && !isValidPhoneNumber(normalizedMobileNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be in E.164 format, for example +919876543210.'
        });
      }
      fieldsToUpdate.mobileNumber = normalizedMobileNumber;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

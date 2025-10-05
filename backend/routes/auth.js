const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { createSystemNodeTypes } = require('../services/systemNodeTypeService');
const auth = require('../middleware/auth');
const passport = require('../middleware/googleAuth');
const { sendVerificationEmail } = require('../services/emailService');

// Check if JWT_SECRET is available
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not defined! Authentication will fail.');
}

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    // Debug: Check if JWT_SECRET is loaded
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined in environment variables!');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);


  await user.save();

  // Send verification email
  await sendVerificationEmail(user, req.headers.origin || 'http://localhost:5001');
  return res.status(200).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (error) {
    console.error('❌ Registration Error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    // Debug: Check if JWT_SECRET is loaded
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined in environment variables!');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!user.googleId) {
      const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
  }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        console.error('JWT signing error:', err);
        return res.status(500).json({ message: 'Token generation failed' });
      }
      res.json({ token });
    });
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), async (req, res) => {
  const payload = { user: { id: req.user.id } };
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
    if (err) throw err;
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?token=${token}`);
  });
});

router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();
    // Create default system node types for new user after verification
    await createSystemNodeTypes(user.id);
    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

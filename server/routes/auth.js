const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Google OAuth client
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone('en-IN').withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, password, phone } = req.body;
    console.log('Registration data:', { name, email, phone: phone ? 'provided' : 'not provided' });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone
    });

    await user.save();
    console.log('User created successfully:', user._id);

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile: user.profile,
        isProfileComplete: user.isProfileComplete()
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.message 
      });
    }
    
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile: user.profile,
        isProfileComplete: user.isProfileComplete()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/google
// @desc    Login/Register with Google ID Token
// @access  Public
router.post('/google', async (req, res) => {
  try {
    if (!googleClient) {
      return res.status(500).json({ message: 'Google auth not configured', details: 'Missing GOOGLE_CLIENT_ID' });
    }

    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Missing Google ID token' });
    }

    // Verify token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: googleClientId
      });
    } catch (verifyErr) {
      console.error('Google token verify failed:', {
        error: verifyErr?.message,
        audienceConfigured: googleClientId,
      });
      return res.status(401).json({ message: 'Invalid Google token', details: 'Token verification failed' });
    }
    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email?.toLowerCase();
    const name = payload.name || payload.given_name || 'Google User';
    const avatarUrl = payload.picture;
    const emailVerified = payload.email_verified;

    if (!email || !emailVerified) {
      return res.status(400).json({ message: 'Google account email not verified' });
    }

    // Find user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // Create new user with provider google
      user = new User({
        name,
        email,
        provider: 'google',
        googleId,
        avatarUrl
      });
      await user.save();
    } else {
      // Link googleId/provider if existing local account
      let changed = false;
      if (!user.googleId) {
        user.googleId = googleId;
        changed = true;
      }
      if (user.provider !== 'google') {
        user.provider = 'google';
        changed = true;
      }
      if (avatarUrl && user.avatarUrl !== avatarUrl) {
        user.avatarUrl = avatarUrl;
        changed = true;
      }
      if (changed) {
        await user.save();
      }
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile: user.profile,
        isProfileComplete: user.isProfileComplete(),
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        profile: req.user.profile,
        isProfileComplete: req.user.isProfileComplete(),
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;

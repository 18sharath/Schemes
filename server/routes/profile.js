const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json({
      profile: req.user.profile,
      isProfileComplete: req.user.isProfileComplete()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', [
  auth,
  body('age').optional().isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
  body('income').optional().isFloat({ min: 0 }).withMessage('Income must be a positive number'),
  body('caste_group').optional().isIn(['General', 'OBC', 'SC', 'ST', 'Minority', 'Other']).withMessage('Invalid caste group'),
  body('occupation').optional().trim().isLength({ max: 100 }).withMessage('Occupation cannot exceed 100 characters'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('state').optional().trim().isLength({ max: 50 }).withMessage('State name cannot exceed 50 characters'),
  body('interests').optional().isArray().withMessage('Interests must be an array'),
  body('previous_applications').optional().isArray().withMessage('Previous applications must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      age,
      income,
      caste_group,
      occupation,
      gender,
      state,
      interests,
      previous_applications
    } = req.body;

    // Update profile fields
    const profileUpdate = {};
    if (age !== undefined) profileUpdate['profile.age'] = age;
    if (income !== undefined) profileUpdate['profile.income'] = income;
    if (caste_group !== undefined) profileUpdate['profile.caste_group'] = caste_group;
    if (occupation !== undefined) profileUpdate['profile.occupation'] = occupation;
    if (gender !== undefined) profileUpdate['profile.gender'] = gender;
    if (state !== undefined) profileUpdate['profile.state'] = state;
    if (interests !== undefined) profileUpdate['profile.interests'] = interests;
    if (previous_applications !== undefined) profileUpdate['profile.previous_applications'] = previous_applications;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: profileUpdate },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      profile: user.profile,
      isProfileComplete: user.isProfileComplete()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// @route   POST /api/profile/complete
// @desc    Mark profile as complete
// @access  Private
router.post('/complete', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.isProfileComplete': true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile marked as complete',
      isProfileComplete: user.isProfileComplete()
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/profile/status
// @desc    Get profile completion status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const profile = req.user.profile;
    const status = {
      isComplete: req.user.isProfileComplete(),
      missingFields: [],
      completionPercentage: 0
    };

    const requiredFields = [
      { field: 'age', value: profile.age },
      { field: 'income', value: profile.income },
      { field: 'caste_group', value: profile.caste_group },
      { field: 'occupation', value: profile.occupation },
      { field: 'gender', value: profile.gender },
      { field: 'state', value: profile.state },
      { field: 'interests', value: profile.interests && profile.interests.length > 0 }
    ];

    const completedFields = requiredFields.filter(field => field.value !== undefined && field.value !== null && field.value !== '');
    status.completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);
    status.missingFields = requiredFields
      .filter(field => !field.value || (Array.isArray(field.value) && field.value.length === 0))
      .map(field => field.field);

    res.json(status);
  } catch (error) {
    console.error('Profile status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

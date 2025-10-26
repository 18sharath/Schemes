const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const mlService = require('../services/mlService');

const router = express.Router();

// @route   POST /api/recommendations
// @desc    Get scheme recommendations for user
// @access  Private
router.post('/', [
  auth,
  body('top_k').optional().isInt({ min: 1, max: 50 }).withMessage('top_k must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { top_k = 10 } = req.body;
    const userProfile = req.user.profile;

    // Check if user profile is complete
    if (!req.user.isProfileComplete()) {
      return res.status(400).json({ 
        message: 'Profile incomplete. Please complete your profile to get recommendations.',
        isProfileComplete: false
      });
    }

    // Check if ML model is available
    const modelInfo = await mlService.getModelInfo();
    if (!modelInfo.isAvailable) {
      return res.status(503).json({ 
        message: 'Recommendation service is temporarily unavailable. Please try again later.',
        modelInfo
      });
    }

    // Get recommendations from ML service
    const recommendations = await mlService.getRecommendations(userProfile, top_k);

    res.json({
      message: 'Recommendations generated successfully',
      recommendations,
      userProfile: {
        age: userProfile.age,
        occupation: userProfile.occupation,
        state: userProfile.state,
        caste_group: userProfile.caste_group,
        interests: userProfile.interests
      },
      totalRecommendations: recommendations.length
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate recommendations. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/recommendations/status
// @desc    Get recommendation service status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const modelInfo = await mlService.getModelInfo();
    const userProfile = req.user.profile;
    
    res.json({
      serviceStatus: 'operational',
      modelInfo,
      userProfile: {
        isComplete: req.user.isProfileComplete(),
        hasRequiredFields: {
          age: !!userProfile.age,
          income: userProfile.income !== undefined,
          caste_group: !!userProfile.caste_group,
          occupation: !!userProfile.occupation,
          gender: !!userProfile.gender,
          state: !!userProfile.state,
          interests: userProfile.interests && userProfile.interests.length > 0
        }
      }
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      message: 'Failed to check service status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/recommendations/quick
// @desc    Get quick recommendations with minimal profile data
// @access  Private
router.post('/quick', [
  auth,
  body('age').isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
  body('occupation').trim().notEmpty().withMessage('Occupation is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('interests').isArray({ min: 1 }).withMessage('At least one interest is required'),
  body('top_k').optional().isInt({ min: 1, max: 20 }).withMessage('top_k must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { age, occupation, state, interests, top_k = 5 } = req.body;

    // Create a minimal profile for quick recommendations
    const quickProfile = {
      age,
      occupation,
      state,
      interests,
      income: 0, // Default value
      caste_group: 'General', // Default value
      gender: 'other', // Default value
      previous_applications: []
    };

    // Check if ML model is available
    const modelInfo = await mlService.getModelInfo();
    if (!modelInfo.isAvailable) {
      return res.status(503).json({ 
        message: 'Recommendation service is temporarily unavailable. Please try again later.',
        modelInfo
      });
    }

    // Get recommendations from ML service
    const recommendations = await mlService.getRecommendations(quickProfile, top_k);

    res.json({
      message: 'Quick recommendations generated successfully',
      recommendations,
      profile: quickProfile,
      totalRecommendations: recommendations.length
    });

  } catch (error) {
    console.error('Quick recommendation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate quick recommendations. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

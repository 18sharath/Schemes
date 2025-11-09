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
  // Validate only if provided
  body('age').optional().custom((value) => {
    if (value !== undefined && value !== null && value !== '') {
      const ageNum = parseInt(value);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
        throw new Error('Age must be between 18 and 100');
      }
    }
    return true;
  }),
  body('occupation').optional().custom((value) => {
    if (value !== undefined && value !== null && value !== '') {
      if (String(value).trim().length === 0) {
        throw new Error('Occupation cannot be empty');
      }
    }
    return true;
  }),
  body('state').optional().custom((value) => {
    if (value !== undefined && value !== null && value !== '') {
      if (String(value).trim().length === 0) {
        throw new Error('State cannot be empty');
      }
    }
    return true;
  }),
  body('interests').optional().custom((value) => {
    if (value !== undefined && value !== null) {
      if (!Array.isArray(value)) {
        throw new Error('Interests must be an array');
      }
    }
    return true;
  }),
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

    // Get data from request body, with sensible defaults - optimized processing
    const age = (() => {
      const val = req.body.age;
      if (val === undefined || val === null || val === '') return 25;
      const parsed = parseInt(val);
      return (isNaN(parsed) || parsed < 18 || parsed > 100) ? 25 : parsed;
    })();

    const occupation = (() => {
      const val = req.body.occupation;
      return (val && String(val).trim()) || 'Student';
    })();

    const state = (() => {
      const val = req.body.state;
      return (val && String(val).trim()) || 'Karnataka';
    })();

    const interests = (() => {
      const val = req.body.interests;
      if (!val || !Array.isArray(val) || val.length === 0) return ['education'];
      const filtered = val.filter(i => i && String(i).trim().length > 0);
      return filtered.length > 0 ? filtered : ['education'];
    })();

    const top_k = req.body.top_k ? parseInt(req.body.top_k) : 10; // Match default of regular endpoint

    // Create a minimal profile for quick recommendations
    const quickProfile = {
      age,
      occupation,
      state,
      interests,
      income: 0,
      caste_group: 'General',
      gender: 'other',
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
      recommendations: recommendations || [],
      profile: quickProfile,
      totalRecommendations: recommendations?.length || 0
    });

  } catch (error) {
    console.error('Quick recommendation error:', error.message);
    res.status(500).json({ 
      message: 'Failed to generate quick recommendations. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

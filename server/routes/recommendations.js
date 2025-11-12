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
    let recommendations = await mlService.getRecommendations(userProfile, top_k);

    // Post-filter recommendations using hard eligibility checks
    recommendations = applyEligibilityFilter(recommendations, req.user.profile);

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
    let recommendations = await mlService.getRecommendations(quickProfile, top_k);

    // Post-filter with whatever data is known (quick profile has limited fields)
    recommendations = applyEligibilityFilter(recommendations, quickProfile);

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

/**
 * Apply strict eligibility filtering and conservative down-ranking based on
 * user profile vs scheme eligibility text. This prevents obviously wrong matches
 * (e.g. scheme only for SC/ST with user caste General; income > threshold).
 */
function applyEligibilityFilter(recommendations, profile) {
  if (!Array.isArray(recommendations)) return [];

  const user = {
    caste: String(profile.caste_group || '').toLowerCase(),
    income: Number(profile.income || 0),
    gender: String(profile.gender || '').toLowerCase(),
    occupation: String(profile.occupation || '').toLowerCase(),
    age: Number(profile.age || 0),
    state: String(profile.state || '').toLowerCase(),
  };

  const filtered = [];

  for (const rec of recommendations) {
    const eligibilityText = String(rec.eligibility || rec.Eligibility || '').toLowerCase();

    // If no eligibility text, allow but do not alter.
    if (!eligibilityText || eligibilityText.trim().length < 5) {
      filtered.push(rec);
      continue;
    }

    // 1) Caste constraints (strict)
    // Detect mentions like "only for sc/st", "reserved for sc", etc.
    const mentionsSC = /\b(sc|scheduled caste)\b/.test(eligibilityText);
    const mentionsST = /\b(st|scheduled tribe)\b/.test(eligibilityText);
    const mentionsOBC = /\bobc\b/.test(eligibilityText);
    const mentionsEBC = /\bebc\b/.test(eligibilityText);
    const mentionsEWS = /\bews\b/.test(eligibilityText);

    // If the text contains explicit caste-only language, enforce it
    const casteOnly = /(only|exclusively|reserved)\s+(for|to)/.test(eligibilityText);
    if (casteOnly) {
      let allowed = false;
      if (mentionsSC && user.caste.includes('sc')) allowed = true;
      if (mentionsST && user.caste.includes('st')) allowed = true;
      if (mentionsOBC && user.caste.includes('obc')) allowed = true;
      if (mentionsEBC && user.caste.includes('ebc')) allowed = true;
      if (mentionsEWS && user.caste.includes('ews')) allowed = true;
      if (!allowed) {
        // Hard reject
        continue;
      }
    } else {
      // If a single caste is clearly specified without "only", softly filter when it clearly excludes
      if ((mentionsSC || mentionsST || mentionsOBC || mentionsEBC || mentionsEWS) && user.caste) {
        const casteMatches =
          (mentionsSC && user.caste.includes('sc')) ||
          (mentionsST && user.caste.includes('st')) ||
          (mentionsOBC && user.caste.includes('obc')) ||
          (mentionsEBC && user.caste.includes('ebc')) ||
          (mentionsEWS && user.caste.includes('ews'));
        if (!casteMatches) {
          // Down-rank heavily by reducing hybrid score if present; otherwise skip
          if (typeof rec.score_hybrid === 'number') {
            rec.score_hybrid = Math.max(0, rec.score_hybrid - 0.5);
          } else {
            continue;
          }
        }
      }
    }

    // 2) Income thresholds
    // Look for patterns like "income below/less than/not exceed/upto 500000"
    const incomeMatch = eligibilityText.match(/(income|annual income|family income)[^0-9]{0,30}([₹rs\.\s]*)(\d[\d,\.]+)/i);
    if (incomeMatch) {
      const raw = incomeMatch[3] || '';
      const threshold = parseInt(raw.replace(/[^\d]/g, ''), 10);
      if (!Number.isNaN(threshold) && threshold > 0) {
        const isUpperBound = /(below|less than|not exceed|upto|up to|<=|less or equal|not more than)/.test(eligibilityText);
        const isLowerBound = /(above|at least|minimum|>=|more than)/.test(eligibilityText);
        if (isUpperBound && user.income && user.income > threshold) {
          continue;
        }
        if (isLowerBound && user.income && user.income < threshold) {
          continue;
        }
      }
    }

    // 3) Gender constraints
    const mentionsWomenOnly = /(women only|only for women|girls only|only for girls|female candidates only)/.test(eligibilityText);
    const mentionsMenOnly = /(men only|only for men|boys only|only for boys|male candidates only)/.test(eligibilityText);
    if (mentionsWomenOnly && user.gender && !user.gender.includes('female')) {
      continue;
    }
    if (mentionsMenOnly && user.gender && !user.gender.includes('male')) {
      continue;
    }

    // 4) Age constraints (simple)
    // Detect "between 18 and 35", "minimum 21", "not above 30"
    const between = eligibilityText.match(/between\s+(\d{1,3})\s+(?:and|to)\s+(\d{1,3})/);
    if (between && user.age) {
      const minA = parseInt(between[1], 10);
      const maxA = parseInt(between[2], 10);
      if (!Number.isNaN(minA) && !Number.isNaN(maxA)) {
        if (user.age < minA || user.age > maxA) continue;
      }
    }
    const minAge = eligibilityText.match(/(minimum|at least|>=)\s+(\d{1,3})\s*(years|yrs)?/);
    if (minAge && user.age) {
      const val = parseInt(minAge[2], 10);
      if (!Number.isNaN(val) && user.age < val) continue;
    }
    const maxAge = eligibilityText.match(/(maximum|not above|<=)\s+(\d{1,3})\s*(years|yrs)?/);
    if (maxAge && user.age) {
      const val = parseInt(maxAge[2], 10);
      if (!Number.isNaN(val) && user.age > val) continue;
    }

    filtered.push(rec);
  }

  // Re-rank: if score_hybrid exists, sort by it; else keep order
  filtered.sort((a, b) => {
    const sa = typeof a.score_hybrid === 'number' ? a.score_hybrid : 0;
    const sb = typeof b.score_hybrid === 'number' ? b.score_hybrid : 0;
    return sb - sa;
  });

  return filtered;
}

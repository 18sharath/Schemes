const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const chatbotService = require('../services/chatbotService');
const User = require('../models/User');
const mlService = require('../services/mlService');

const router = express.Router();

// @route   POST /api/chatbot/message
// @desc    Send a message to the chatbot and get a response
// @access  Public (but can use auth for personalized responses)
router.post('/message', [
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
  body('messageHistory').optional().isArray().withMessage('messageHistory must be an array'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { message, messageHistory = [] } = req.body;
    
    // Get schemes from user's recommendations if authenticated
    let schemes = [];
    try {
      // Try to get user from token if available
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id);
        
        if (user && user.isProfileComplete()) {
          // Get user's recent recommendations for context
          try {
            const recommendations = await mlService.getRecommendations(user.profile, 10);
            schemes = recommendations.map(rec => ({
              name: rec.scheme_name,
              category: rec.schemeCategory,
              level: rec.level,
              details: rec.details,
              benefits: rec.benefits,
              eligibility: rec.eligibility,
            }));
          } catch (error) {
            console.warn('Could not fetch recommendations for chatbot context:', error.message);
            // Continue without schemes context
          }
        }
      }
    } catch (error) {
      // If auth fails or user not found, continue without personalized context
      console.warn('Could not get user context for chatbot:', error.message);
    }

    // Generate response using Gemini
    const response = await chatbotService.generateResponse(message, messageHistory, schemes);

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      message: 'Failed to generate response',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
});

// @route   GET /api/chatbot/status
// @desc    Get chatbot service status
// @access  Public
router.get('/status', async (req, res) => {
  const isConfigured = !!process.env.GEMINI_API_KEY;
  const apiKeyPresent = !!process.env.GEMINI_API_KEY;
  const apiKeyLength = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0;
  
  // Test if model is initialized
  let modelStatus = 'not initialized';
  try {
    if (chatbotService.model && chatbotService.genAI) {
      modelStatus = 'initialized';
    } else {
      modelStatus = 'initialization failed';
    }
  } catch (error) {
    modelStatus = `error: ${error.message}`;
  }

  res.json({
    status: 'OK',
    isConfigured: apiKeyPresent,
    apiKeyPresent: apiKeyPresent,
    apiKeyLength: apiKeyLength,
    modelStatus: modelStatus,
    model: isConfigured ? 'models/gemini-2.5-flash' : 'fallback',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

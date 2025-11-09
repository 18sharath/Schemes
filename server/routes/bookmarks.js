const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const bookmarkReminderJob = require('../jobs/bookmarkReminderJob');

const router = express.Router();

// @route   GET /api/bookmarks
// @desc    Get all bookmarked schemes for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('bookmarks');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Bookmarks retrieved successfully',
      bookmarks: user.bookmarks || [],
      totalBookmarks: user.bookmarks?.length || 0
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve bookmarks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/bookmarks
// @desc    Add a scheme to bookmarks
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { scheme } = req.body;

    if (!scheme || !scheme.scheme_name) {
      return res.status(400).json({ message: 'Scheme data is required' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if scheme is already bookmarked (by scheme_name)
    const existingBookmark = user.bookmarks.find(
      b => b.scheme_name === scheme.scheme_name
    );

    if (existingBookmark) {
      return res.status(400).json({ message: 'Scheme is already bookmarked' });
    }

    // Add bookmark
    user.bookmarks.push({
      ...scheme,
      bookmarkedAt: new Date()
    });

    await user.save();

    res.json({
      message: 'Scheme bookmarked successfully',
      bookmark: user.bookmarks[user.bookmarks.length - 1],
      totalBookmarks: user.bookmarks.length
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ 
      message: 'Failed to bookmark scheme',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/bookmarks/:schemeName
// @desc    Remove a scheme from bookmarks
// @access  Private
router.delete('/:schemeName', auth, async (req, res) => {
  try {
    const schemeName = decodeURIComponent(req.params.schemeName);

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find and remove bookmark
    const bookmarkIndex = user.bookmarks.findIndex(
      b => b.scheme_name === schemeName
    );

    if (bookmarkIndex === -1) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    user.bookmarks.splice(bookmarkIndex, 1);
    await user.save();

    res.json({
      message: 'Bookmark removed successfully',
      totalBookmarks: user.bookmarks.length
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ 
      message: 'Failed to remove bookmark',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/bookmarks/check/:schemeName
// @desc    Check if a scheme is bookmarked
// @access  Private
router.get('/check/:schemeName', auth, async (req, res) => {
  try {
    const schemeName = decodeURIComponent(req.params.schemeName);

    const user = await User.findById(req.user.id).select('bookmarks');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isBookmarked = user.bookmarks.some(
      b => b.scheme_name === schemeName
    );

    res.json({
      isBookmarked,
      schemeName
    });
  } catch (error) {
    console.error('Check bookmark error:', error);
    res.status(500).json({ 
      message: 'Failed to check bookmark status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/bookmarks/test-reminder
// @desc    Test bookmark reminder email (for development)
// @access  Private
router.post('/test-reminder', auth, async (req, res) => {
  try {
    const result = await bookmarkReminderJob.sendReminderToUser(req.user.id);
    
    if (result.success) {
      res.json({
        message: 'Test reminder email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(400).json({
        message: 'Failed to send test reminder',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Test reminder error:', error);
    res.status(500).json({
      message: 'Failed to send test reminder',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;


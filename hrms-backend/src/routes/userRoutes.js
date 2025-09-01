const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { 
  authenticateToken
} = require('../middleware/auth');

// Get user statistics route
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await User.getStatistics();
    
    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: { stats }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: 'Internal server error'
    });
  }
});

// Health check for users
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User service is healthy',
    service: 'users'
  });
});

module.exports = router;

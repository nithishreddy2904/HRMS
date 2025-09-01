const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  getProfile,
  logout
} = require('../controllers/authController');

// Import middleware
const { 
  authenticateToken
} = require('../middleware/auth');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get profile route
router.get('/profile', authenticateToken, getProfile);

// Logout route  
router.post('/logout', authenticateToken, logout);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is healthy',
    timestamp: new Date().toISOString(),
    service: 'auth'
  });
});

module.exports = router;

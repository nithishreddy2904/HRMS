const express = require('express');
const router = express.Router();

// Import controllers
const {
  getPayrollData,
  generatePayroll,
  getPayrollStats
} = require('../controllers/payrollController');

// Import middleware
const { 
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth');

/**
 * @route   GET /api/payroll
 * @desc    Get payroll data with filters
 * @access  Private
 * @query   { month, year, department }
 */
router.get('/', authenticateToken, getPayrollData);

/**
 * @route   POST /api/payroll/generate
 * @desc    Generate payroll for specified period
 * @access  Private (Admin/HR only)
 * @body    { month, year, department? }
 */
router.post('/generate', 
  authenticateToken, 
  authorizeRoles('admin', 'hr'), 
  generatePayroll
);

/**
 * @route   GET /api/payroll/stats
 * @desc    Get payroll statistics
 * @access  Private
 * @query   { month, year }
 */
router.get('/stats', authenticateToken, getPayrollStats);

/**
 * @route   GET /api/payroll/health
 * @desc    Health check for payroll service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Payroll service is healthy',
    service: 'payroll',
    endpoints: {
      getPayrollData: 'GET /api/payroll',
      generatePayroll: 'POST /api/payroll/generate',
      getStats: 'GET /api/payroll/stats'
    }
  });
});

module.exports = router;

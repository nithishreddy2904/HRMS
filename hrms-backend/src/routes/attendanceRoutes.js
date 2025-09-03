const express = require('express');
const router = express.Router();

// Import controllers
const {
  getAttendanceRecords,
  getAttendanceStats,
  markAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');

// Import middleware
const { 
  authenticateToken
} = require('../middleware/auth');

/**
 * @route   GET /api/attendance
 * @desc    Get attendance records with filters
 * @access  Private
 * @query   { startDate, endDate, employeeId, status }
 */
router.get('/', authenticateToken, getAttendanceRecords);

/**
 * @route   GET /api/attendance/stats
 * @desc    Get attendance statistics
 * @access  Private
 * @query   { month, year }
 */
router.get('/stats', authenticateToken, getAttendanceStats);

/**
 * @route   POST /api/attendance
 * @desc    Mark attendance
 * @access  Private
 * @body    { employeeId?, date, status, checkInTime?, checkOutTime?, notes? }
 */
router.post('/', authenticateToken, markAttendance);

/**
 * @route PUT /api/attendance/:id
 * @desc Update attendance record
 * @access Private
 */
router.put('/:id', authenticateToken, updateAttendance);

/**
 * @route DELETE /api/attendance/:id
 * @desc Delete attendance record
 * @access Private
 */
router.delete('/:id', authenticateToken, deleteAttendance);


/**
 * @route   GET /api/attendance/health
 * @desc    Health check for attendance service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Attendance service is healthy',
    service: 'attendance',
    endpoints: {
      getRecords: 'GET /api/attendance',
      getStats: 'GET /api/attendance/stats',
      markAttendance: 'POST /api/attendance'
    }
  });
});

module.exports = router;

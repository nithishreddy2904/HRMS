const db = require('../config/database');

// Get attendance records with filters
const getAttendanceRecords = async (req, res) => {
  try {
    const { startDate, endDate, employeeId, status } = req.query;
    const userId = req.user.id;
    
    console.log('📊 Fetching attendance records:', { startDate, endDate, employeeId, status });
    
    let query = `
      SELECT 
        a.id,
        a.employee_id,
        a.date,
        a.clock_in,
        a.clock_out,
        a.total_hours,
        a.overtime_hours,
        a.status,
        a.notes,
        e.first_name,
        e.last_name,
        e.employee_id as emp_code,
        u.name as employee_name
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (startDate) {
      query += ' AND a.date >= ?';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ' AND a.date <= ?';
      queryParams.push(endDate);
    }
    
    if (employeeId) {
      query += ' AND a.employee_id = ?';
      queryParams.push(employeeId);
    }
    
    if (status) {
      query += ' AND a.status = ?';
      queryParams.push(status);
    }
    
    // For non-admin users, only show their own records
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      query += ' AND e.user_id = ?';
      queryParams.push(userId);
    }
    
    query += ' ORDER BY a.date DESC, a.clock_in DESC';
    
    const [records] = await db.execute(query, queryParams);
    
    // Format the records
    const formattedRecords = records.map(record => ({
      id: record.id,
      employeeId: record.emp_code || `EMP${String(record.employee_id).padStart(3, '0')}`,
      employeeName: record.employee_name || `${record.first_name || ''} ${record.last_name || ''}`.trim() || 'Unknown Employee',
      date: record.date,
      checkInTime: record.clock_in,
      checkOutTime: record.clock_out,
      totalHours: record.total_hours || 0,
      overtimeHours: record.overtime_hours || 0,
      status: record.status || 'present',
      notes: record.notes
    }));
    
    console.log(`✅ Found ${formattedRecords.length} attendance records`);
    
    res.status(200).json({
      success: true,
      message: 'Attendance records retrieved successfully',
      data: {
        records: formattedRecords,
        total: formattedRecords.length
      }
    });
    
  } catch (error) {
    console.error('❌ Get attendance records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance records',
      error: 'Internal server error'
    });
  }
};

// Get attendance statistics
const getAttendanceStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.id;
    
    console.log('📈 Fetching attendance stats:', { month, year });
    
    let query = `
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as half_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_arrivals,
        SUM(total_hours) as total_hours,
        SUM(overtime_hours) as total_overtime
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (month && year) {
      query += ' AND MONTH(a.date) = ? AND YEAR(a.date) = ?';
      queryParams.push(parseInt(month), parseInt(year));
    }
    
    // For non-admin users, only show their own stats
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      query += ' AND e.user_id = ?';
      queryParams.push(userId);
    }
    
    const [statsResult] = await db.execute(query, queryParams);
    const stats = statsResult[0] || {};
    
    const formattedStats = {
      totalDays: parseInt(stats.total_days) || 0,
      presentDays: parseInt(stats.present_days) || 0,
      absentDays: parseInt(stats.absent_days) || 0,
      halfDays: parseInt(stats.half_days) || 0,
      lateArrival: parseInt(stats.late_arrivals) || 0,
      totalHours: parseFloat(stats.total_hours) || 0,
      totalOvertime: parseFloat(stats.total_overtime) || 0
    };
    
    console.log('✅ Attendance stats retrieved:', formattedStats);
    
    res.status(200).json({
      success: true,
      message: 'Attendance statistics retrieved successfully',
      data: { stats: formattedStats }
    });
    
  } catch (error) {
    console.error('❌ Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance statistics',
      error: 'Internal server error'
    });
  }
};

// Mark attendance
const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, checkInTime, checkOutTime, notes } = req.body;
    const userId = req.user.id;
    
    console.log('✅ Marking attendance:', { employeeId, date, status });
    
    // Get employee ID from user ID if not provided
    let actualEmployeeId = employeeId;
    if (!actualEmployeeId) {
      const [employeeResult] = await db.execute(
        'SELECT id FROM employees WHERE user_id = ?',
        [userId]
      );
      
      if (employeeResult.length > 0) {
        actualEmployeeId = employeeResult[0].id;
      } else {
        // Create employee record if doesn't exist
        const [userResult] = await db.execute(
          'SELECT name, email FROM users WHERE id = ?',
          [userId]
        );
        
        if (userResult.length > 0) {
          const user = userResult[0];
          const nameParts = user.name.split(' ');
          const firstName = nameParts[0] || 'Unknown';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          const [insertResult] = await db.execute(
            `INSERT INTO employees (user_id, employee_id, first_name, last_name, email, hire_date, status) 
             VALUES (?, ?, ?, ?, ?, CURDATE(), 'active')`,
            [userId, `EMP${String(userId).padStart(3, '0')}`, firstName, lastName, user.email]
          );
          
          actualEmployeeId = insertResult.insertId;
          console.log(`✅ Created employee record with ID: ${actualEmployeeId}`);
        }
      }
    }
    
    // Calculate total hours if both check-in and check-out are provided
    let totalHours = null;
    if (checkInTime && checkOutTime) {
      const checkIn = new Date(`${date} ${checkInTime}`);
      const checkOut = new Date(`${date} ${checkOutTime}`);
      const diffMs = checkOut - checkIn;
      totalHours = Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
    }
    
    // Check if attendance already exists for this employee and date
    const [existingResult] = await db.execute(
      'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
      [actualEmployeeId, date]
    );
    
    if (existingResult.length > 0) {
      // Update existing record
      const [updateResult] = await db.execute(
        `UPDATE attendance 
         SET clock_in = ?, clock_out = ?, status = ?, notes = ?, total_hours = ?, updated_at = CURRENT_TIMESTAMP
         WHERE employee_id = ? AND date = ?`,
        [checkInTime, checkOutTime, status, notes, totalHours, actualEmployeeId, date]
      );
      
      console.log('✅ Updated existing attendance record');
    } else {
      // Insert new record
      const [insertResult] = await db.execute(
        `INSERT INTO attendance (employee_id, date, clock_in, clock_out, status, notes, total_hours) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [actualEmployeeId, date, checkInTime, checkOutTime, status, notes, totalHours]
      );
      
      console.log('✅ Created new attendance record with ID:', insertResult.insertId);
    }
    
    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        employeeId: actualEmployeeId,
        date,
        status,
        checkInTime,
        checkOutTime,
        totalHours,
        notes
      }
    });
    
  } catch (error) {
    console.error('❌ Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: 'Internal server error'
    });
  }
};

module.exports = {
  getAttendanceRecords,
  getAttendanceStats,
  markAttendance
};

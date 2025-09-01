
const db = require('../config/database');
const Employee = require('../models/Employee'); // Import the Employee model

// Get attendance records with filters
const getAttendanceRecords = async (req, res) => {
  try {
    const { startDate, endDate, employeeId, status, limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('📊 Fetching attendance records:', { startDate, endDate, employeeId, status, userRole });

    let query = `
      SELECT 
        a.id,
        a.employee_id,
        a.date,
        a.clock_in,
        a.clock_out,
        a.break_start,
        a.break_end,
        a.total_hours,
        a.overtime_hours,
        a.status,
        a.notes,
        a.created_at,
        a.updated_at,
        e.employee_id as emp_code,
        e.first_name,
        e.last_name,
        e.email as employee_email,
        u.name as employee_name,
        d.name as department_name,
        p.title as position_title
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE 1=1
    `;

    const queryParams = [];

    // Apply date filters
    if (startDate) {
      query += ' AND a.date >= ?';
      queryParams.push(startDate);
    }

    if (endDate) {
      query += ' AND a.date <= ?';
      queryParams.push(endDate);
    }

    // Apply employee filter
    if (employeeId) {
      query += ' AND (a.employee_id = ? OR e.employee_id = ?)';
      queryParams.push(employeeId, employeeId);
    }

    // Apply status filter
    if (status) {
      query += ' AND a.status = ?';
      queryParams.push(status);
    }

    // Role-based access control
    if (userRole !== 'admin' && userRole !== 'hr') {
      // Non-admin users can only see their own records
      query += ' AND e.user_id = ?';
      queryParams.push(userId);
    }

    // Get total count for pagination
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // Add ordering and pagination to main query
    query += ' ORDER BY a.date DESC, a.clock_in DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [records] = await db.execute(query, queryParams);

    // Format the records
    const formattedRecords = records.map(record => ({
      id: record.id,
      employeeId: record.emp_code || `EMP${String(record.employee_id).padStart(3, '0')}`,
      employeeName: record.employee_name || `${record.first_name || ''} ${record.last_name || ''}`.trim() || 'Unknown Employee',
      employeeEmail: record.employee_email,
      departmentName: record.department_name,
      positionTitle: record.position_title,
      date: record.date,
      checkInTime: record.clock_in,
      checkOutTime: record.clock_out,
      breakStart: record.break_start,
      breakEnd: record.break_end,
      totalHours: parseFloat(record.total_hours) || 0,
      overtimeHours: parseFloat(record.overtime_hours) || 0,
      status: record.status || 'present',
      notes: record.notes,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    }));

    console.log(`✅ Found ${formattedRecords.length} attendance records`);

    res.status(200).json({
      success: true,
      message: 'Attendance records retrieved successfully',
      data: {
        records: formattedRecords,
        pagination: {
          total: parseInt(total),
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < parseInt(total)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get attendance records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance records',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get attendance statistics
const getAttendanceStats = async (req, res) => {
  try {
    const { month, year, employeeId } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('📈 Fetching attendance stats:', { month, year, employeeId, userRole });

    let query = `
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN a.status = 'half_day' THEN 1 ELSE 0 END) as half_days,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_arrivals,
        SUM(a.total_hours) as total_hours,
        SUM(a.overtime_hours) as total_overtime,
        AVG(a.total_hours) as avg_daily_hours,
        COUNT(DISTINCT a.employee_id) as unique_employees
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.id
      WHERE 1=1
    `;

    const queryParams = [];

    // Apply date filters
    if (month && year) {
      query += ' AND MONTH(a.date) = ? AND YEAR(a.date) = ?';
      queryParams.push(parseInt(month), parseInt(year));
    } else if (year) {
      query += ' AND YEAR(a.date) = ?';
      queryParams.push(parseInt(year));
    } else {
      // Default to current month if no filters provided
      query += ' AND MONTH(a.date) = MONTH(CURDATE()) AND YEAR(a.date) = YEAR(CURDATE())';
    }

    // Apply employee filter
    if (employeeId) {
      query += ' AND (a.employee_id = ? OR e.employee_id = ?)';
      queryParams.push(employeeId, employeeId);
    }

    // Role-based access control
    if (userRole !== 'admin' && userRole !== 'hr') {
      // Non-admin users can only see their own stats
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
      totalOvertime: parseFloat(stats.total_overtime) || 0,
      avgDailyHours: parseFloat(stats.avg_daily_hours) || 0,
      uniqueEmployees: parseInt(stats.unique_employees) || 0
    };

    // Add attendance rate calculation
    if (formattedStats.totalDays > 0) {
      formattedStats.attendanceRate = ((formattedStats.presentDays + formattedStats.halfDays * 0.5) / formattedStats.totalDays * 100).toFixed(2);
    } else {
      formattedStats.attendanceRate = 0;
    }

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
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Mark attendance
const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, checkInTime, checkOutTime, breakStart, breakEnd, notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('✅ Marking attendance:', { employeeId, date, status, userRole });

    // Validate required fields
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required',
        error: 'Missing required field: date'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
        error: 'Missing required field: status'
      });
    }

    // Validate status values
    const validStatuses = ['present', 'absent', 'late', 'half_day', 'holiday'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Determine which employee we're marking attendance for
    let targetEmployee;

    if (employeeId && (userRole === 'admin' || userRole === 'hr')) {
      // Admin/HR can mark attendance for any employee
      targetEmployee = await Employee.findByEmployeeId(employeeId) || await Employee.findById(employeeId);
      if (!targetEmployee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found',
          error: `No employee found with ID: ${employeeId}`
        });
      }
    } else {
      // Regular users can only mark their own attendance
      targetEmployee = await Employee.findByUserId(userId);
      if (!targetEmployee) {
        // Create employee record if doesn't exist
        const user = await db.execute('SELECT name, email FROM users WHERE id = ?', [userId]);
        if (user[0].length > 0) {
          const userData = user[0][0];
          const nameParts = userData.name.split(' ');
          const firstName = nameParts[0] || 'Unknown';
          const lastName = nameParts.slice(1).join(' ') || '';

          const employeeData = {
            user_id: userId,
            employee_id: `EMP${String(userId).padStart(3, '0')}`,
            first_name: firstName,
            last_name: lastName,
            email: userData.email,
            hire_date: new Date().toISOString().split('T')[0], // Today's date
            status: 'active'
          };

          targetEmployee = await Employee.create(employeeData);
          console.log(`✅ Created employee record for user ${userId}`);
        } else {
          return res.status(404).json({
            success: false,
            message: 'User not found',
            error: 'Unable to create employee record'
          });
        }
      }
    }

    // Calculate total hours if both check-in and check-out are provided
    let totalHours = null;
    let overtimeHours = 0;

    if (checkInTime && checkOutTime) {
      const checkIn = new Date(`${date} ${checkInTime}`);
      const checkOut = new Date(`${date} ${checkOutTime}`);

      if (checkOut > checkIn) {
        let workingMinutes = (checkOut - checkIn) / (1000 * 60); // Convert to minutes

        // Subtract break time if provided
        if (breakStart && breakEnd) {
          const breakStartTime = new Date(`${date} ${breakStart}`);
          const breakEndTime = new Date(`${date} ${breakEnd}`);
          if (breakEndTime > breakStartTime) {
            const breakMinutes = (breakEndTime - breakStartTime) / (1000 * 60);
            workingMinutes -= breakMinutes;
          }
        }

        totalHours = Math.max(0, workingMinutes / 60); // Convert back to hours

        // Calculate overtime (assuming 8 hours is standard work day)
        const standardHours = 8;
        if (totalHours > standardHours) {
          overtimeHours = totalHours - standardHours;
        }
      }
    }

    // Check if attendance already exists for this employee and date
    const [existingResult] = await db.execute(
      'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
      [targetEmployee.id, date]
    );

    if (existingResult.length > 0) {
      // Update existing record
      const updateQuery = `
        UPDATE attendance 
        SET clock_in = ?, clock_out = ?, break_start = ?, break_end = ?, 
            status = ?, notes = ?, total_hours = ?, overtime_hours = ?, 
            updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = ? AND date = ?
      `;

      await db.execute(updateQuery, [
        checkInTime, checkOutTime, breakStart, breakEnd, 
        status, notes, totalHours, overtimeHours, 
        targetEmployee.id, date
      ]);

      console.log('✅ Updated existing attendance record');
    } else {
      // Insert new record
      const insertQuery = `
        INSERT INTO attendance 
        (employee_id, date, clock_in, clock_out, break_start, break_end, 
         status, notes, total_hours, overtime_hours) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await db.execute(insertQuery, [
        targetEmployee.id, date, checkInTime, checkOutTime, breakStart, breakEnd,
        status, notes, totalHours, overtimeHours
      ]);

      console.log('✅ Created new attendance record');
    }

    // Fetch the updated/created record to return
    const [recordResult] = await db.execute(`
      SELECT a.*, e.employee_id as emp_code, e.first_name, e.last_name, u.name as employee_name
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE a.employee_id = ? AND a.date = ?
    `, [targetEmployee.id, date]);

    const record = recordResult[0];
    const formattedRecord = {
      id: record.id,
      employeeId: record.emp_code,
      employeeName: record.employee_name || `${record.first_name || ''} ${record.last_name || ''}`.trim(),
      date: record.date,
      checkInTime: record.clock_in,
      checkOutTime: record.clock_out,
      breakStart: record.break_start,
      breakEnd: record.break_end,
      totalHours: parseFloat(record.total_hours) || 0,
      overtimeHours: parseFloat(record.overtime_hours) || 0,
      status: record.status,
      notes: record.notes
    };

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: formattedRecord
    });

  } catch (error) {
    console.error('❌ Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update attendance record
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('📝 Updating attendance:', { id, updateData, userRole });

    // Check if record exists and user has permission
    const [existingRecord] = await db.execute(`
      SELECT a.*, e.user_id as employee_user_id
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.id
      WHERE a.id = ?
    `, [id]);

    if (existingRecord.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
        error: `No attendance record found with ID: ${id}`
      });
    }

    // Check permissions
    const record = existingRecord[0];
    if (userRole !== 'admin' && userRole !== 'hr' && record.employee_user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this attendance record',
        error: 'Insufficient permissions'
      });
    }

    // Build update query dynamically
    const allowedUpdates = [
      'date', 'clock_in', 'clock_out', 'break_start', 'break_end',
      'status', 'notes', 'total_hours', 'overtime_hours'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key) && updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
        error: 'At least one valid field must be provided'
      });
    }

    updateValues.push(id); // For WHERE clause

    const updateQuery = `
      UPDATE attendance 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.execute(updateQuery, updateValues);

    // Fetch updated record
    const [updatedRecord] = await db.execute(`
      SELECT a.*, e.employee_id as emp_code, e.first_name, e.last_name, u.name as employee_name
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE a.id = ?
    `, [id]);

    const formattedRecord = {
      id: updatedRecord[0].id,
      employeeId: updatedRecord[0].emp_code,
      employeeName: updatedRecord[0].employee_name || `${updatedRecord[0].first_name || ''} ${updatedRecord[0].last_name || ''}`.trim(),
      date: updatedRecord[0].date,
      checkInTime: updatedRecord[0].clock_in,
      checkOutTime: updatedRecord[0].clock_out,
      breakStart: updatedRecord[0].break_start,
      breakEnd: updatedRecord[0].break_end,
      totalHours: parseFloat(updatedRecord[0].total_hours) || 0,
      overtimeHours: parseFloat(updatedRecord[0].overtime_hours) || 0,
      status: updatedRecord[0].status,
      notes: updatedRecord[0].notes
    };

    console.log('✅ Attendance record updated successfully');

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: formattedRecord
    });

  } catch (error) {
    console.error('❌ Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete attendance record
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('🗑️ Deleting attendance:', { id, userRole });

    // Check if record exists and user has permission
    const [existingRecord] = await db.execute(`
      SELECT a.*, e.user_id as employee_user_id
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.id
      WHERE a.id = ?
    `, [id]);

    if (existingRecord.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
        error: `No attendance record found with ID: ${id}`
      });
    }

    // Check permissions
    const record = existingRecord[0];
    if (userRole !== 'admin' && userRole !== 'hr' && record.employee_user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this attendance record',
        error: 'Insufficient permissions'
      });
    }

    // Delete the record
    const [result] = await db.execute('DELETE FROM attendance WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found or already deleted',
        error: 'Record may have been deleted by another user'
      });
    }

    console.log('✅ Attendance record deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
      data: { deletedId: parseInt(id) }
    });

  } catch (error) {
    console.error('❌ Delete attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete attendance record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAttendanceRecords,
  getAttendanceStats,
  markAttendance,
  updateAttendance,
  deleteAttendance
};

const db = require('../config/database');

// Get payroll data
const getPayrollData = async (req, res) => {
  try {
    const { month, year, department } = req.query;
    
    console.log('💰 Fetching payroll data:', { month, year, department });
    
    let query = `
      SELECT 
        p.id,
        p.employee_id,
        p.pay_period_start,
        p.pay_period_end,
        p.basic_salary,
        p.overtime_pay,
        p.bonus,
        p.allowances,
        p.deductions,
        p.tax_deduction,
        p.net_pay,
        p.status,
        p.processed_at,
        e.employee_id as emp_code,
        e.first_name,
        e.last_name,
        u.name as employee_name,
        d.name as department_name
      FROM payroll p
      LEFT JOIN employees e ON p.employee_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (month && year) {
      query += ' AND MONTH(p.pay_period_start) = ? AND YEAR(p.pay_period_start) = ?';
      queryParams.push(parseInt(month), parseInt(year));
    }
    
    if (department) {
      query += ' AND d.name = ?';
      queryParams.push(department);
    }
    
    // For non-admin users, only show their own payroll
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      query += ' AND e.user_id = ?';
      queryParams.push(req.user.id);
    }
    
    query += ' ORDER BY p.pay_period_start DESC, e.employee_id';
    
    const [payrollRecords] = await db.execute(query, queryParams);
    
    // Format the records
    const formattedRecords = payrollRecords.map(record => ({
      id: record.id,
      employeeId: record.emp_code || `EMP${String(record.employee_id).padStart(3, '0')}`,
      employeeName: record.employee_name || `${record.first_name || ''} ${record.last_name || ''}`.trim() || 'Unknown Employee',
      department: record.department_name || 'Unassigned',
      basicSalary: parseFloat(record.basic_salary) || 0,
      overtimePay: parseFloat(record.overtime_pay) || 0,
      bonus: parseFloat(record.bonus) || 0,
      allowances: parseFloat(record.allowances) || 0,
      deductions: parseFloat(record.deductions) || 0,
      taxDeduction: parseFloat(record.tax_deduction) || 0,
      netSalary: parseFloat(record.net_pay) || 0,
      status: record.status || 'draft',
      processedAt: record.processed_at,
      payPeriodStart: record.pay_period_start,
      payPeriodEnd: record.pay_period_end
    }));
    
    console.log(`✅ Found ${formattedRecords.length} payroll records`);
    
    res.status(200).json({
      success: true,
      message: 'Payroll data retrieved successfully',
      data: {
        payrollData: formattedRecords,
        total: formattedRecords.length
      }
    });
    
  } catch (error) {
    console.error('❌ Get payroll data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payroll data',
      error: 'Internal server error'
    });
  }
};

// Generate payroll
const generatePayroll = async (req, res) => {
  try {
    const { month, year, department } = req.body;
    
    console.log('🔄 Generating payroll:', { month, year, department });
    
    // Get employees for payroll generation
    let employeeQuery = `
      SELECT 
        e.id,
        e.employee_id,
        e.user_id,
        e.first_name,
        e.last_name,
        e.salary,
        u.name,
        d.name as department_name
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.status = 'active'
    `;
    
    const employeeParams = [];
    
    if (department && department !== 'All Departments') {
      employeeQuery += ' AND d.name = ?';
      employeeParams.push(department);
    }
    
    const [employees] = await db.execute(employeeQuery, employeeParams);
    
    console.log(`✅ Found ${employees.length} employees for payroll generation`);
    
    // Calculate pay period dates
    const payPeriodStart = new Date(year, month - 1, 1);
    const payPeriodEnd = new Date(year, month, 0); // Last day of the month
    
    const payrollRecords = [];
    
    for (const employee of employees) {
      const basicSalary = parseFloat(employee.salary) || 30000;
      
      // Calculate attendance-based salary adjustments
      const [attendanceResult] = await db.execute(
        `SELECT 
           COUNT(*) as total_days,
           SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
           SUM(CASE WHEN status = 'half_day' THEN 0.5 ELSE 1 END) as effective_days,
           SUM(overtime_hours) as total_overtime
         FROM attendance 
         WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
        [employee.id, month, year]
      );
      
      const attendance = attendanceResult[0] || {};
      const workingDays = new Date(year, month, 0).getDate(); // Days in month
      const presentDays = parseInt(attendance.present_days) || 0;
      const effectiveDays = parseFloat(attendance.effective_days) || 0;
      const totalOvertime = parseFloat(attendance.total_overtime) || 0;
      
      // Calculate salary components
      const dailySalary = basicSalary / workingDays;
      const adjustedBasicSalary = dailySalary * Math.min(effectiveDays, workingDays);
      
      const overtimeRate = (basicSalary / workingDays / 8) * 1.5; // 1.5x hourly rate
      const overtimePay = totalOvertime * overtimeRate;
      
      const allowances = adjustedBasicSalary * 0.2; // 20% of basic salary
      const bonus = presentDays >= workingDays * 0.95 ? basicSalary * 0.05 : 0; // 5% bonus for 95%+ attendance
      
      const grossSalary = adjustedBasicSalary + overtimePay + allowances + bonus;
      const taxDeduction = grossSalary > 50000 ? grossSalary * 0.1 : grossSalary * 0.05;
      const otherDeductions = grossSalary * 0.02; // 2% for other deductions
      
      const totalDeductions = taxDeduction + otherDeductions;
      const netPay = grossSalary - totalDeductions;
      
      // Check if payroll already exists
      const [existingPayroll] = await db.execute(
        `SELECT id FROM payroll 
         WHERE employee_id = ? AND MONTH(pay_period_start) = ? AND YEAR(pay_period_start) = ?`,
        [employee.id, month, year]
      );
      
      if (existingPayroll.length > 0) {
        // Update existing payroll
        await db.execute(
          `UPDATE payroll 
           SET basic_salary = ?, overtime_pay = ?, bonus = ?, allowances = ?, 
               deductions = ?, tax_deduction = ?, net_pay = ?, status = 'processed',
               processed_by = ?, processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [adjustedBasicSalary, overtimePay, bonus, allowances, otherDeductions, 
           taxDeduction, netPay, req.user.id, existingPayroll[0].id]
        );
      } else {
        // Insert new payroll record
        const [insertResult] = await db.execute(
          `INSERT INTO payroll (employee_id, pay_period_start, pay_period_end, basic_salary, 
                               overtime_pay, bonus, allowances, deductions, tax_deduction, net_pay, 
                               status, processed_by, processed_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processed', ?, CURRENT_TIMESTAMP)`,
          [employee.id, payPeriodStart, payPeriodEnd, adjustedBasicSalary, overtimePay, 
           bonus, allowances, otherDeductions, taxDeduction, netPay, req.user.id]
        );
      }
      
      payrollRecords.push({
        employeeId: employee.employee_id || `EMP${String(employee.id).padStart(3, '0')}`,
        employeeName: employee.name || `${employee.first_name} ${employee.last_name}`,
        department: employee.department_name || 'Unassigned',
        basicSalary: adjustedBasicSalary,
        overtimePay,
        bonus,
        allowances,
        deductions: otherDeductions,
        taxDeduction,
        netPay,
        attendanceDays: presentDays,
        workingDays
      });
    }
    
    console.log(`✅ Generated payroll for ${payrollRecords.length} employees`);
    
    res.status(200).json({
      success: true,
      message: 'Payroll generated successfully',
      data: {
        generatedRecords: payrollRecords.length,
        payrollData: payrollRecords,
        summary: {
          totalEmployees: payrollRecords.length,
          totalAmount: payrollRecords.reduce((sum, record) => sum + record.netPay, 0),
          period: `${month}/${year}`
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Generate payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payroll',
      error: 'Internal server error'
    });
  }
};

// Get payroll summary/stats
const getPayrollStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    console.log('📊 Fetching payroll stats:', { month, year });
    
    let query = `
      SELECT 
        COUNT(*) as total_employees,
        SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) as processed,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as pending,
        SUM(net_pay) as total_amount,
        AVG(net_pay) as average_salary
      FROM payroll p
      LEFT JOIN employees e ON p.employee_id = e.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (month && year) {
      query += ' AND MONTH(p.pay_period_start) = ? AND YEAR(p.pay_period_start) = ?';
      queryParams.push(parseInt(month), parseInt(year));
    }
    
    const [statsResult] = await db.execute(query, queryParams);
    const stats = statsResult[0] || {};
    
    const formattedStats = {
      totalEmployees: parseInt(stats.total_employees) || 0,
      processed: parseInt(stats.processed) || 0,
      pending: parseInt(stats.pending) || 0,
      totalAmount: parseFloat(stats.total_amount) || 0,
      averageSalary: parseFloat(stats.average_salary) || 0
    };
    
    console.log('✅ Payroll stats retrieved:', formattedStats);
    
    res.status(200).json({
      success: true,
      message: 'Payroll statistics retrieved successfully',
      data: { stats: formattedStats }
    });
    
  } catch (error) {
    console.error('❌ Get payroll stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payroll statistics',
      error: 'Internal server error'
    });
  }
};

module.exports = {
  getPayrollData,
  generatePayroll,
  getPayrollStats
};

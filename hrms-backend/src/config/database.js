const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration without specifying database initially
const dbConfigWithoutDB = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Nithish@2904',
  port: parseInt(process.env.DB_PORT) || 3306,
  charset: 'utf8mb4'
};

// Database configuration with database specified
const dbConfig = {
  ...dbConfigWithoutDB,
  database: process.env.DB_NAME || 'hrms_db'
};

let pool;

// Initialize database and tables
const initializeDatabase = async () => {
  try {
    console.log('🔄 Connecting to MySQL server...');
    
    // First, connect without specifying database
    const tempConnection = await mysql.createConnection(dbConfigWithoutDB);
    
    // Create database if it doesn't exist (use query instead of execute)
    const databaseName = process.env.DB_NAME || 'hrms_db';
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    console.log(`✅ Database '${databaseName}' created/verified`);
    
    // Use the database (use query instead of execute)
    await tempConnection.query(`USE \`${databaseName}\``);
    
    console.log('🔄 Creating database tables...');
    
    // Create users table for authentication
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'hr', 'employee', 'manager') DEFAULT 'employee',
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        email_verified BOOLEAN DEFAULT FALSE,
        email_verification_token VARCHAR(255) NULL,
        password_reset_token VARCHAR(255) NULL,
        password_reset_expires DATETIME NULL,
        last_login DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_status (status)
      ) ENGINE=InnoDB
    `;
    
    // Create departments table
    const createDepartmentsTable = `
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        manager_id INT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_status (status)
      ) ENGINE=InnoDB
    `;
    
    // Create positions table
    const createPositionsTable = `
      CREATE TABLE IF NOT EXISTS positions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        department_id INT,
        min_salary DECIMAL(12, 2),
        max_salary DECIMAL(12, 2),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_title (title),
        INDEX idx_department (department_id)
      ) ENGINE=InnoDB
    `;
    
    // Create employees table
    const createEmployeesTable = `
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other'),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        hire_date DATE NOT NULL,
        department_id INT,
        position_id INT,
        manager_id INT,
        salary DECIMAL(12, 2),
        employment_type ENUM('full-time', 'part-time', 'contract', 'intern') DEFAULT 'full-time',
        status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(20),
        emergency_contact_relationship VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_employee_id (employee_id),
        INDEX idx_email (email),
        INDEX idx_department (department_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB
    `;
    
    // Create attendance table
    const createAttendanceTable = `
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        date DATE NOT NULL,
        clock_in TIME,
        clock_out TIME,
        break_start TIME,
        break_end TIME,
        total_hours DECIMAL(4, 2),
        overtime_hours DECIMAL(4, 2) DEFAULT 0,
        status ENUM('present', 'absent', 'late', 'half_day', 'holiday') DEFAULT 'present',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_employee_date (employee_id, date),
        INDEX idx_date (date),
        INDEX idx_status (status)
      ) ENGINE=InnoDB
    `;
    
    // Create payroll table
    const createPayrollTable = `
      CREATE TABLE IF NOT EXISTS payroll (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        pay_period_start DATE NOT NULL,
        pay_period_end DATE NOT NULL,
        basic_salary DECIMAL(12, 2) NOT NULL,
        overtime_pay DECIMAL(12, 2) DEFAULT 0,
        bonus DECIMAL(12, 2) DEFAULT 0,
        allowances DECIMAL(12, 2) DEFAULT 0,
        deductions DECIMAL(12, 2) DEFAULT 0,
        tax_deduction DECIMAL(12, 2) DEFAULT 0,
        net_pay DECIMAL(12, 2) NOT NULL,
        status ENUM('draft', 'processed', 'paid') DEFAULT 'draft',
        processed_by INT,
        processed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_employee (employee_id),
        INDEX idx_pay_period (pay_period_start, pay_period_end),
        INDEX idx_status (status)
      ) ENGINE=InnoDB
    `;
    
    // Execute table creation queries using query() instead of execute()
    await tempConnection.query(createUsersTable);
    console.log('✅ Users table created');
    
    await tempConnection.query(createDepartmentsTable);
    console.log('✅ Departments table created');
    
    await tempConnection.query(createPositionsTable);
    console.log('✅ Positions table created');
    
    await tempConnection.query(createEmployeesTable);
    console.log('✅ Employees table created');
    
    await tempConnection.query(createAttendanceTable);
    console.log('✅ Attendance table created');
    
    await tempConnection.query(createPayrollTable);
    console.log('✅ Payroll table created');
    
    // Add foreign key constraints after all tables are created
    try {
      await tempConnection.query(`
        ALTER TABLE employees 
        ADD CONSTRAINT fk_employee_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      `);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        console.log('Note: Employee-User foreign key already exists or cannot be created');
      }
    }
    
    try {
      await tempConnection.query(`
        ALTER TABLE employees 
        ADD CONSTRAINT fk_employee_department 
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      `);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        console.log('Note: Employee-Department foreign key already exists or cannot be created');
      }
    }
    
    try {
      await tempConnection.query(`
        ALTER TABLE employees 
        ADD CONSTRAINT fk_employee_position 
        FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL
      `);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        console.log('Note: Employee-Position foreign key already exists or cannot be created');
      }
    }
    
    try {
      await tempConnection.query(`
        ALTER TABLE attendance 
        ADD CONSTRAINT fk_attendance_employee 
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      `);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        console.log('Note: Attendance-Employee foreign key already exists or cannot be created');
      }
    }
    
    try {
      await tempConnection.query(`
        ALTER TABLE payroll 
        ADD CONSTRAINT fk_payroll_employee 
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      `);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        console.log('Note: Payroll-Employee foreign key already exists or cannot be created');
      }
    }
    
    // Close temporary connection
    await tempConnection.end();
    
    // Now create pool with database specified
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    console.log('✅ All database tables created/verified successfully');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    // Provide specific error messages
    if (error.code === 'ER_ACCESS_DENIED_FOR_USER') {
      console.error('💡 Check your MySQL username and password in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure MySQL server is running');
    } else if (error.code === 'ENOTFOUND') {
      console.error('💡 Check your MySQL host address in .env file');
    }
    
    throw error;
  }
};

// Initialize database when module loads
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error.message);
});

// Export database functions
module.exports = {
  execute: async (query, params) => {
    if (!pool) {
      // If pool not ready, create a temporary connection
      const tempConnection = await mysql.createConnection(dbConfig);
      const result = await tempConnection.execute(query, params);
      await tempConnection.end();
      return result;
    }
    return await pool.execute(query, params);
  },
  
  query: async (query, params) => {
    if (!pool) {
      // If pool not ready, create a temporary connection
      const tempConnection = await mysql.createConnection(dbConfig);
      const result = await tempConnection.query(query, params);
      await tempConnection.end();
      return result;
    }
    return await pool.query(query, params);
  },
  
  getConnection: async () => {
    if (!pool) {
      throw new Error('Database pool not initialized yet');
    }
    return await pool.getConnection();
  },
  
  end: async () => {
    if (pool) {
      await pool.end();
    }
  }
};

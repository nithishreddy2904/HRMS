const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'employee';
    this.status = data.status || 'active';
    this.email_verified = data.email_verified || false;
    this.email_verification_token = data.email_verification_token;
    this.password_reset_token = data.password_reset_token;
    this.password_reset_expires = data.password_reset_expires;
    this.last_login = data.last_login;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    try {
      const { name, email, password, role = 'employee' } = userData;
      
      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const query = `
        INSERT INTO users (name, email, password, role) 
        VALUES (?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [name, email, hashedPassword, role]);
      
      // Return user without password
      return await User.findById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('User with this email already exists');
      }
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const query = `
        SELECT id, name, email, role, status, email_verified, 
               last_login, created_at, updated_at 
        FROM users 
        WHERE id = ? AND status != 'suspended'
      `;
      
      const [rows] = await db.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const query = `
        SELECT id, name, email, role, status, email_verified, 
               last_login, created_at, updated_at 
        FROM users 
        WHERE email = ? AND status != 'suspended'
      `;
      
      const [rows] = await db.execute(query, [email]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by email with password (for authentication)
  static async findByEmailWithPassword(email) {
    try {
      const query = `
        SELECT id, name, email, password, role, status, email_verified, 
               last_login, created_at, updated_at 
        FROM users 
        WHERE email = ? AND status = 'active'
      `;
      
      const [rows] = await db.execute(query, [email]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update user's last login
  static async updateLastLogin(id) {
    try {
      const query = `
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      await db.execute(query, [id]);
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }

  // Get user statistics (for dashboard)
  static async getStatistics() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_users,
          SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_users,
          SUM(CASE WHEN role = 'hr' THEN 1 ELSE 0 END) as hr_users,
          SUM(CASE WHEN role = 'manager' THEN 1 ELSE 0 END) as manager_users,
          SUM(CASE WHEN role = 'employee' THEN 1 ELSE 0 END) as employee_users,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_registrations,
          SUM(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as active_last_week
        FROM users
        WHERE status != 'suspended'
      `;
      
      const [rows] = await db.execute(query);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;


const db = require('../config/database');

class Employee {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.employee_id = data.employee_id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.phone = data.phone;
    this.date_of_birth = data.date_of_birth;
    this.gender = data.gender;
    this.address = data.address;
    this.city = data.city;
    this.state = data.state;
    this.country = data.country;
    this.postal_code = data.postal_code;
    this.hire_date = data.hire_date;
    this.department_id = data.department_id;
    this.position_id = data.position_id;
    this.manager_id = data.manager_id;
    this.salary = data.salary;
    this.employment_type = data.employment_type;
    this.status = data.status;
    this.emergency_contact_name = data.emergency_contact_name;
    this.emergency_contact_phone = data.emergency_contact_phone;
    this.emergency_contact_relationship = data.emergency_contact_relationship;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new employee
  static async create(employeeData) {
    try {
      const {
        user_id,
        employee_id,
        first_name,
        last_name,
        email,
        phone,
        hire_date,
        department_id = null,
        position_id = null,
        salary = null,
        employment_type = 'full-time',
        status = 'active'
      } = employeeData;

      const query = `
        INSERT INTO employees 
        (user_id, employee_id, first_name, last_name, email, phone, hire_date, 
         department_id, position_id, salary, employment_type, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.execute(query, [
        user_id, employee_id, first_name, last_name, email, phone, hire_date,
        department_id, position_id, salary, employment_type, status
      ]);

      return await Employee.findById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Employee with this ID or email already exists');
      }
      throw error;
    }
  }

  // Find employee by ID
  static async findById(id) {
    try {
      const query = `
        SELECT e.*, u.name as user_name
        FROM employees e
        LEFT JOIN users u ON e.user_id = u.id
        WHERE e.id = ? AND e.status != 'terminated'
      `;

      const [rows] = await db.execute(query, [id]);

      if (rows.length === 0) {
        return null;
      }

      return new Employee(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find employee by user ID
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT e.*, u.name as user_name
        FROM employees e
        LEFT JOIN users u ON e.user_id = u.id
        WHERE e.user_id = ? AND e.status != 'terminated'
      `;

      const [rows] = await db.execute(query, [userId]);

      if (rows.length === 0) {
        return null;
      }

      return new Employee(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find employee by employee ID
  static async findByEmployeeId(employeeId) {
    try {
      const query = `
        SELECT e.*, u.name as user_name
        FROM employees e
        LEFT JOIN users u ON e.user_id = u.id
        WHERE e.employee_id = ? AND e.status != 'terminated'
      `;

      const [rows] = await db.execute(query, [employeeId]);

      if (rows.length === 0) {
        return null;
      }

      return new Employee(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get all employees with pagination
  static async findAll(limit = 50, offset = 0, filters = {}) {
    try {
      let query = `
        SELECT e.*, u.name as user_name,
               d.name as department_name,
               p.title as position_title
        FROM employees e
        LEFT JOIN users u ON e.user_id = u.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN positions p ON e.position_id = p.id
        WHERE e.status != 'terminated'
      `;

      const queryParams = [];

      // Apply filters
      if (filters.department_id) {
        query += ' AND e.department_id = ?';
        queryParams.push(filters.department_id);
      }

      if (filters.status) {
        query += ' AND e.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.employment_type) {
        query += ' AND e.employment_type = ?';
        queryParams.push(filters.employment_type);
      }

      // Add ordering and pagination
      query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);

      const [rows] = await db.execute(query, queryParams);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM employees e
        WHERE e.status != 'terminated'
      `;
      const countParams = [];

      if (filters.department_id) {
        countQuery += ' AND e.department_id = ?';
        countParams.push(filters.department_id);
      }

      if (filters.status) {
        countQuery += ' AND e.status = ?';
        countParams.push(filters.status);
      }

      if (filters.employment_type) {
        countQuery += ' AND e.employment_type = ?';
        countParams.push(filters.employment_type);
      }

      const [countRows] = await db.execute(countQuery, countParams);
      const total = countRows[0].total;

      return {
        employees: rows.map(row => new Employee(row)),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update employee
  static async update(id, updateData) {
    try {
      const allowedUpdates = [
        'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
        'gender', 'address', 'city', 'state', 'country', 'postal_code',
        'department_id', 'position_id', 'manager_id', 'salary',
        'employment_type', 'status', 'emergency_contact_name',
        'emergency_contact_phone', 'emergency_contact_relationship'
      ];

      const updateFields = [];
      const updateValues = [];

      // Build dynamic update query
      Object.keys(updateData).forEach(key => {
        if (allowedUpdates.includes(key) && updateData[key] !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(updateData[key]);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateValues.push(id); // For WHERE clause

      const query = `
        UPDATE employees 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status != 'terminated'
      `;

      const [result] = await db.execute(query, updateValues);

      if (result.affectedRows === 0) {
        throw new Error('Employee not found or cannot be updated');
      }

      return await Employee.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Get employee statistics
  static async getStatistics() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_employees,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_employees,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_employees,
          SUM(CASE WHEN employment_type = 'full-time' THEN 1 ELSE 0 END) as full_time,
          SUM(CASE WHEN employment_type = 'part-time' THEN 1 ELSE 0 END) as part_time,
          SUM(CASE WHEN employment_type = 'contract' THEN 1 ELSE 0 END) as contract,
          SUM(CASE WHEN DATE(hire_date) = CURDATE() THEN 1 ELSE 0 END) as new_hires_today,
          SUM(CASE WHEN hire_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_hires_last_30_days
        FROM employees
        WHERE status != 'terminated'
      `;

      const [rows] = await db.execute(query);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Soft delete employee
  static async softDelete(id) {
    try {
      const query = `
        UPDATE employees 
        SET status = 'terminated', updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status != 'terminated'
      `;

      const [result] = await db.execute(query, [id]);

      if (result.affectedRows === 0) {
        throw new Error('Employee not found or already terminated');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Employee;


import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or Redux store
    const token = localStorage.getItem('authToken') || 
                  sessionStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request for debugging (remove in production)
    console.log('🔄 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasAuth: !!token
    });

    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common responses
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses (remove in production)
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });

    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message
    });

    // Handle common error cases
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');

      // Redirect to login (you might want to use React Router here)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API service methods
const apiService = {
  // Generic HTTP methods
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),

  // Authentication methods
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    getProfile: () => apiClient.get('/auth/profile'),
    refreshToken: () => apiClient.post('/auth/refresh'),
  },

  // Attendance methods
  attendance: {
    // Get attendance records with optional filters
    getRecords: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          searchParams.append(key, params[key]);
        }
      });

      return apiClient.get(`/attendance?${searchParams.toString()}`);
    },

    // Get attendance statistics
    getStats: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          searchParams.append(key, params[key]);
        }
      });

      return apiClient.get(`/attendance/stats?${searchParams.toString()}`);
    },

    // Mark attendance
    markAttendance: (attendanceData) => {
      return apiClient.post('/attendance', attendanceData);
    },

    // Update attendance record
    updateAttendance: (id, attendanceData) => {
      return apiClient.put(`/attendance/${id}`, attendanceData);
    },

    // Delete attendance record
    deleteAttendance: (id) => {
      return apiClient.delete(`/attendance/${id}`);
    },
  },

  // Employee methods
  employees: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          searchParams.append(key, params[key]);
        }
      });

      return apiClient.get(`/employees?${searchParams.toString()}`);
    },

    getById: (id) => apiClient.get(`/employees/${id}`),
    create: (employeeData) => apiClient.post('/employees', employeeData),
    update: (id, employeeData) => apiClient.put(`/employees/${id}`, employeeData),
    delete: (id) => apiClient.delete(`/employees/${id}`),
  },

  // Payroll methods
  payroll: {
    getRecords: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          searchParams.append(key, params[key]);
        }
      });

      return apiClient.get(`/payroll?${searchParams.toString()}`);
    },

    create: (payrollData) => apiClient.post('/payroll', payrollData),
    update: (id, payrollData) => apiClient.put(`/payroll/${id}`, payrollData),
    delete: (id) => apiClient.delete(`/payroll/${id}`),
  },
};

export default apiService;
export { apiClient, API_BASE_URL };

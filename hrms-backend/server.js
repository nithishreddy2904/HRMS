const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize Express app
const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'HRMS API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Basic test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Import and use routes
try {
  const authRoutes = require('./src/routes/authRoutes');
  const attendanceRoutes = require('./src/routes/attendanceRoutes');
  
  // Mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/attendance', attendanceRoutes);
  
  console.log('✅ Routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'Not Found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Set default error values
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json(error);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    error.message = 'Duplicate entry. This record already exists.';
    return res.status(409).json(error);
  }

  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    return res.status(401).json(error);
  }

  // Default to 500 server error
  res.status(err.statusCode || 500).json(error);
});

// Database connection and server startup
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Import and initialize database first
    console.log('🔄 Setting up database connection...');
    const db = require('./src/config/database');
    
    // Wait for database initialization to complete
    await new Promise((resolve) => {
      setTimeout(resolve, 2000); // Give database time to initialize
    });
    
    // Test database connection
    await db.execute('SELECT 1 as test');
    console.log('✅ Database connected successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 HRMS Backend Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Test: http://localhost:${PORT}/api/test`);
      console.log(`📊 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log('');
      console.log('🔗 Available API endpoints:');
      console.log('POST   /api/auth/register');
      console.log('POST   /api/auth/login');
      console.log('GET    /api/auth/profile');
      console.log('GET    /api/auth/health');
      console.log('');
      console.log('💡 Ready to accept requests!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    
    // Provide helpful error messages
    if (error.code === 'ER_ACCESS_DENIED_FOR_USER') {
      console.error('💡 Fix: Check your MySQL username/password in .env file');
      console.error('   Current settings: DB_USER=' + process.env.DB_USER);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Fix: Make sure MySQL server is running');
      console.error('   Try: net start mysql (Windows) or brew services start mysql (Mac)');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Fix: Database will be created automatically on next restart');
    }
    
    console.error('🔄 Retrying in 5 seconds...');
    setTimeout(() => {
      process.exit(1);
    }, 5000);
  }
};

// Error handlers
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();

module.exports = app;

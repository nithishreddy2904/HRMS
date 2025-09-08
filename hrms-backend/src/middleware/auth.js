const { verifyAccessToken } = require('../config/auth');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: 'No authorization header provided'
      });
    }

    // Extract token from Bearer format
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid - user not found',
        error: 'User associated with token no longer exists'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active',
        error: 'User account is inactive or suspended'
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        error: 'Please login again'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: 'Token is malformed or invalid'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'Internal server error during authentication'
    });
  }
};

// Middleware to authorize specific roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user exists (should be set by authenticateToken middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'User not authenticated. Use authenticateToken middleware first.'
        });
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
          error: `Role '${req.user.role}' is not authorized. Required roles: ${allowedRoles.join(', ')}`
        });
      }

      console.log(`✅ Role authorization passed: ${req.user.role} for ${req.method} ${req.originalUrl}`);
      next();
    } catch (error) {
      console.error('Authorization middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
        error: 'Internal server error during authorization'
      });
    }
  };
};

// Export both middleware functions
module.exports = {
  authenticateToken,
  authorizeRoles    // ← ADD THIS MISSING EXPORT
};

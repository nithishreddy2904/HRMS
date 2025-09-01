const User = require('../models/User');
const { generateTokenPair } = require('../config/auth');
const { 
  validate, 
  registerSchema, 
  loginSchema, 
  checkPasswordStrength 
} = require('../utils/validators');

// User registration
const register = async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    
    // Validate input data
    const validatedData = validate(registerSchema, req.body);
    
    // Check password strength
    const passwordStrength = checkPasswordStrength(validatedData.password);
    if (!passwordStrength.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        passwordRequirements: passwordStrength.checks
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(validatedData.email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        error: 'An account with this email address already exists'
      });
    }

    // Create new user
    const newUser = await User.create(validatedData);
    
    // Generate tokens
    const tokens = generateTokenPair(newUser);

    // Log registration event
    console.log(`✅ New user registered: ${newUser.email} (ID: ${newUser.id})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          created_at: newUser.created_at
        },
        ...tokens
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Please check your input data',
        details: error.details
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: 'An internal server error occurred during registration'
    });
  }
};

// User login
const login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body.email);
    
    // Validate input data
    const validatedData = validate(loginSchema, req.body);
    const { email, password } = validatedData;

    // Find user with password
    const userData = await User.findByEmailWithPassword(email);
    if (!userData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'Email or password is incorrect'
      });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'Email or password is incorrect'
      });
    }

    // Check if account is active
    if (userData.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active',
        error: `Your account status is: ${userData.status}. Please contact administrator.`
      });
    }

    // Create user object without password
    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: userData.status,
      email_verified: userData.email_verified,
      last_login: userData.last_login,
      created_at: userData.created_at
    };

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Update last login time
    await User.updateLastLogin(user.id);

    // Log login event
    console.log(`✅ User logged in: ${user.email} (ID: ${user.id})`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        ...tokens
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Please check your input data',
        details: error.details
      });
    }

    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: 'An internal server error occurred during login'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'The authenticated user no longer exists'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          email_verified: user.email_verified,
          last_login: user.last_login,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: 'An internal server error occurred'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    console.log(`User logged out: ${req.user.email} (ID: ${req.user.id})`);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: {
        message: 'Please remove the token from client storage'
      }
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: 'An internal server error occurred during logout'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout
};

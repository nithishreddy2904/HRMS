const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  expiresIn: process.env.JWT_EXPIRE || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
};

// Validate JWT configuration
if (!jwtConfig.secret || !jwtConfig.refreshSecret) {
  console.error('❌ JWT secrets are not configured properly');
  process.exit(1);
}

// Generate access token
const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    issuer: 'hrms-api',
    audience: 'hrms-client'
  });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
    issuer: 'hrms-api',
    audience: 'hrms-client'
  });
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret, {
      issuer: 'hrms-api',
      audience: 'hrms-client'
    });
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.refreshSecret, {
      issuer: 'hrms-api',
      audience: 'hrms-client'
    });
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Generate token pair (access + refresh)
const generateTokenPair = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user.id });

  return {
    accessToken,
    refreshToken,
    expiresIn: jwtConfig.expiresIn,
    tokenType: 'Bearer'
  };
};

// Decode token without verification (for expired token info)
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  jwtConfig,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  decodeToken
};

import jwt from 'jsonwebtoken';
import { logger } from './logger.js';

/**
 * Generate Access Token (short-lived, ~7 days)
 */
export const generateAccessToken = (userId, email, role, tenantId, name) => {
  try {
    const token = jwt.sign(
      {
        userId: userId.toString(),  // ⬅️ ADD: convert ObjectId to string
        email,
        role,
        tenantId: tenantId.toString(),
        name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    return token;
  } catch (error) {
    logger.error('Error generating access token:', error.message);
    throw error;
  }
};

/**
 * Generate Refresh Token (long-lived, ~30 days)
 */
export const generateRefreshToken = (userId, tenantId) => {
  try {
    const token = jwt.sign(
      {
        userId: userId.toString(),  // ⬅️ ADD: convert ObjectId to string
        tenantId: tenantId.toString(),
        type: 'refresh',
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d' }
    );
    return token;
  } catch (error) {
    logger.error('Error generating refresh token:', error.message);
    throw error;
  }
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw {
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
        name: 'TokenExpiredError',
      };
    }
    throw {
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
      name: 'JsonWebTokenError',
    };
  }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw {
        message: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED',
        name: 'TokenExpiredError',
      };
    }
    throw {
      message: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN',
      name: 'JsonWebTokenError',
    };
  }
};

/**
 * Sign Access Token (new function - for consistency)
 * Use this in controllers instead of manually calling jwt.sign
 */
export const signAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
};

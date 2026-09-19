import { logger } from '../utils/logger.js';

/**
 * Global Error Handler Middleware
 * Catches all errors thrown in the application and returns consistent JSON responses.
 */
export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || 'Internal Server Error';

  // Log the error
  logger.error(`[${statusCode}] ${message}`, {
    stack: error.stack,
    path: req.path,
    method: req.method,
    tenant: req.tenantId,
  });

  // Mongoose Validation Error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: messages,
    });
  }

  // Mongoose Duplicate Key Error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(409).json({
      status: 'error',
      message: `${field} already exists`,
      code: 'DUPLICATE_KEY',
    });
  }

  // JWT Errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Default error response
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

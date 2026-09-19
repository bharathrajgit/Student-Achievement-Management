import { verifyAccessToken } from '../utils/tokenUtils.js';
import { logger } from '../utils/logger.js';

/**
 * Authentication Middleware: Verify JWT token
 * Extracts user data and attaches to req.user
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authorization header missing or invalid',
        code: 'NO_AUTH_HEADER',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyAccessToken(token);
      
      // IMPORTANT: Normalize to 'id' for consistency
      req.user = {
        id: decoded.userId,           // Use 'id' consistently
        userId: decoded.userId,       // Keep for backward compatibility
        role: decoded.role,
        tenantId: decoded.tenantId,
        email: decoded.email,
      };
      
      req.tenantId = decoded.tenantId;

      logger.debug(
        `Auth middleware: User ${req.user.id} (${req.user.email}) authenticated`
      );
      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: error.message || 'Token verification failed',
        code: error.code || 'AUTH_ERROR',
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Authentication failed',
      details: error.message,
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 */
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        `Authorization denied: User ${req.user.id} (role: ${req.user.role}) tried to access restricted resource`
      );
      return res.status(403).json({
        status: 'error',
        message: 'Access denied: insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
      });
    }

    next();
  };
};

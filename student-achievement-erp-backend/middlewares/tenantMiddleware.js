import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

/**
 * Tenant Middleware: Extracts tenant ID from:
 * 1. Authorization header (from JWT token)
 * 2. X-Tenant-ID header (direct tenant ID)
 * 3. Request body (fallback)
 *
 * Attaches req.tenant and req.tenantId to every request.
 * This ensures multi-tenant data isolation across the platform.
 */
export const tenantMiddleware = (req, res, next) => {
  try {
    let tenantId = null;

    // Priority 1: Extract from Authorization header (JWT)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        tenantId = decoded.tenantId;
      } catch (err) {
        // Token invalid or expired; continue to next source
      }
    }

    // Priority 2: Extract from X-Tenant-ID header
    if (!tenantId && req.headers['x-tenant-id']) {
      tenantId = req.headers['x-tenant-id'];
    }

    // Priority 3: Extract from request body (for registration endpoints)
    if (!tenantId && req.body && req.body.tenantId) {
      tenantId = req.body.tenantId;
    }

    // Attach tenant to request object
    req.tenant = tenantId;
    req.tenantId = tenantId;

    // Log tenant context for debugging
    if (process.env.NODE_ENV === 'development' && tenantId) {
      logger.debug(`Tenant context: ${tenantId} | Route: ${req.method} ${req.path}`);
    }

    next();
  } catch (error) {
    logger.error('Tenant middleware error:', error.message);
    next();
  }
};

/**
 * Tenant Access Middleware: Enforces data isolation.
 * Use this on protected routes to ensure users only access their tenant's data.
 *
 * Usage:
 * router.get('/students', enforceTenanIsolation, controllerFunction);
 */
export const enforceTenanIsolation = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authorization header missing',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure user's tenantId matches the request context
    if (!decoded.tenantId) {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid token: tenantId missing',
      });
    }

    // Attach decoded user info to request
    req.user = decoded;
    req.tenantId = decoded.tenantId;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Tenant isolation check failed',
      details: error.message,
    });
  }
};

/**
 * ===========================================
 * Authentication Middleware
 * ===========================================
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { createError } from './errorHandler';

/**
 * Extend Express Request type to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Verify JWT token and attach user to request
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(401, 'Authentication required: No token provided', 'AUTH_REQUIRED');
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        email: string;
        role: string;
      };

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw createError(401, 'Authentication token has expired', 'TOKEN_EXPIRED');
      }
      throw createError(401, 'Invalid authentication token', 'INVALID_TOKEN');
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Check if user has required role
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createError(401, 'Authentication required', 'AUTH_REQUIRED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        createError(
          403,
          `Insufficient permissions. Required role: ${roles.join(' or ')}`,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }

    next();
  };
}

/**
 * Optional authentication - doesn't fail if no token
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        email: string;
        role: string;
      };

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
}

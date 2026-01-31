/**
 * ===========================================
 * Authentication Routes
 * ===========================================
 */

import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler';
import { authRateLimiter } from '../middleware/rateLimiter';
import * as authService from '../services/auth.service';

const router = Router();

/**
 * Validation schemas
 */
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  role: z.enum(['ADMIN', 'USER', 'VIEWER']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post(
  '/register',
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);

    res.status(201).json({
      success: true,
      data: result,
    });
  })
);

/**
 * POST /api/v1/auth/login
 * User login
 */
router.post(
  '/login',
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);

    res.status(200).json({
      success: true,
      data: result,
    });
  })
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const accessToken = authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  })
);

/**
 * POST /api/v1/auth/logout
 * User logout (client-side token deletion)
 */
router.post('/logout', (_req, res) => {
  // Token deletion is handled on the client side
  // In a production app, you might want to implement token blacklisting
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;

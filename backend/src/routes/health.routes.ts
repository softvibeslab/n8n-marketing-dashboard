/**
 * ===========================================
 * Health Check Routes
 * ===========================================
 */

import { Router } from 'express';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

/**
 * Readiness check endpoint
 */
router.get('/ready', (_req, res) => {
  // Check database connection (to be implemented)
  // Check Redis connection (to be implemented)
  // Check external service connections (to be implemented)

  res.status(200).json({
    success: true,
    data: {
      status: 'ready',
      checks: {
        database: 'ok', // To be implemented
        redis: 'ok', // To be implemented
      },
    },
  });
});

/**
 * Liveness check endpoint
 */
router.get('/live', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'alive',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;

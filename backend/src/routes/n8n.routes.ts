/**
 * ===========================================
 * n8n Integration Routes (Placeholder)
 * ===========================================
 */

import { Router } from 'express';

const router = Router();

/**
 * GET /api/v1/n8n/status
 * Check n8n connection status
 */
router.get('/status', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'n8n status check endpoint not yet implemented',
    },
  });
});

/**
 * POST /api/v1/n8n/webhook
 * Receive n8n execution webhooks
 */
router.post('/webhook', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'n8n webhook endpoint not yet implemented',
    },
  });
});

/**
 * GET /api/v1/n8n/executions/:id
 * Get execution details
 */
router.get('/executions/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Execution details endpoint not yet implemented',
    },
  });
});

export default router;

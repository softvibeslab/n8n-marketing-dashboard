/**
 * ===========================================
 * Analytics Routes
 * ===========================================
 */

import { Router, Request } from 'express';
import { analyticsService } from '../services/analytics.service';
import { validateRequest } from '../middleware/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import {
  campaignMetricsSchema,
  platformAnalyticsSchema,
  reportGenerationSchema,
  aiInsightsRequestSchema,
} from '../schemas/analytics.schema';

const router = Router();

/**
 * Extend Request type with user property
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * GET /api/v1/analytics/campaigns/:id
 * Get campaign analytics
 */
router.get(
  '/campaigns/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const campaignId = req.params.id;
    const { period, breakdown } = req.query;

    const metrics = await analyticsService.getCampaignMetrics(
      campaignId,
      {
        period: (period as string) || '30d',
        breakdown: breakdown as any,
      },
      userId
    );

    res.status(200).json({
      success: true,
      data: metrics,
    });
  })
);

/**
 * POST /api/v1/analytics/platform
 * Fetch platform-specific analytics
 */
router.post(
  '/platform',
  validateRequest({ body: platformAnalyticsSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const metrics = await analyticsService.fetchPlatformAnalytics(req.body, userId);

    res.status(200).json({
      success: true,
      data: metrics,
    });
  })
);

/**
 * GET /api/v1/analytics/campaigns/:id/realtime
 * Get real-time metrics
 */
router.get(
  '/campaigns/:id/realtime',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const campaignId = req.params.id;

    const metrics = await analyticsService.getRealtimeMetrics(campaignId, userId);

    res.status(200).json({
      success: true,
      data: metrics,
    });
  })
);

/**
 * POST /api/v1/analytics/insights
 * Get AI-generated insights
 */
router.post(
  '/insights',
  validateRequest({ body: aiInsightsRequestSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const insights = await analyticsService.generateAIInsights(
      req.body.campaignId,
      req.body,
      userId
    );

    res.status(200).json({
      success: true,
      data: insights,
    });
  })
);

/**
 * POST /api/v1/analytics/reports
 * Generate custom report
 */
router.post(
  '/reports',
  validateRequest({ body: reportGenerationSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const report = await analyticsService.generateReport(
      req.body.campaignId,
      req.body,
      userId
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  })
);

export default router;

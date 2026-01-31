/**
 * ===========================================
 * Strategy Routes
 * ===========================================
 */

import { Router, Request } from 'express';
import { strategyService } from '../services/strategy.service';
import { validateRequest } from '../middleware/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import {
  strategyInputSchema,
  createStrategyRequestSchema,
  updateStrategyRequestSchema,
} from '../schemas/strategy.schema';

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
 * POST /api/v1/strategy/analyze
 * Analyze strategy input with AI
 */
router.post(
  '/analyze',
  validateRequest({ body: strategyInputSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const analysis = await strategyService.analyzeStrategy(req.body);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  })
);

/**
 * POST /api/v1/strategy/campaigns
 * Create new campaign with strategy
 */
router.post(
  '/campaigns',
  validateRequest({ body: createStrategyRequestSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const campaign = await strategyService.createCampaign(userId, req.body);

    res.status(201).json({
      success: true,
      data: campaign,
    });
  })
);

/**
 * GET /api/v1/strategy/campaigns
 * List campaigns for user
 */
router.get(
  '/campaigns',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const { status, page, pageSize } = req.query;

    const campaigns = await strategyService.listCampaigns(userId, {
      status: status as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: campaigns,
    });
  })
);

/**
 * GET /api/v1/strategy/campaigns/:id
 * Get campaign by ID
 */
router.get(
  '/campaigns/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const campaignId = req.params.id;

    const campaign = await strategyService.getCampaign(campaignId, userId);

    res.status(200).json({
      success: true,
      data: campaign,
    });
  })
);

/**
 * PATCH /api/v1/strategy/campaigns/:id
 * Update campaign strategy
 */
router.patch(
  '/campaigns/:id',
  validateRequest({ body: updateStrategyRequestSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const campaignId = req.params.id;

    const campaign = await strategyService.updateCampaign(campaignId, userId, req.body);

    res.status(200).json({
      success: true,
      data: campaign,
    });
  })
);

/**
 * DELETE /api/v1/strategy/campaigns/:id
 * Delete campaign
 */
router.delete(
  '/campaigns/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const campaignId = req.params.id;

    await strategyService.deleteCampaign(campaignId, userId);

    res.status(200).json({
      success: true,
      data: { message: 'Campaign deleted successfully' },
    });
  })
);

/**
 * GET /api/v1/strategy/templates
 * Get strategy templates
 */
router.get(
  '/templates',
  asyncHandler(async (req, res) => {
    const { category } = req.query;

    const templates = await strategyService.getTemplates(category as string | undefined);

    res.status(200).json({
      success: true,
      data: templates,
    });
  })
);

/**
 * GET /api/v1/strategy/templates/:id
 * Get strategy template by ID
 */
router.get(
  '/templates/:id',
  asyncHandler(async (req, res) => {
    const templateId = req.params.id;

    const template = await strategyService.getTemplate(templateId);

    res.status(200).json({
      success: true,
      data: template,
    });
  })
);

export default router;

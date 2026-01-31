/**
 * ===========================================
 * Asset Routes
 * ===========================================
 */

import { Router, Request } from 'express';
import { assetService } from '../services/asset.service';
import { validateRequest } from '../middleware/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import {
  assetGenerationRequestSchema,
  createAssetRequestSchema,
  updateAssetRequestSchema,
  batchAssetGenerationSchema,
} from '../schemas/asset.schema';

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
 * POST /api/v1/assets/generate
 * Generate asset (text/image)
 */
router.post(
  '/generate',
  validateRequest({ body: assetGenerationRequestSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const campaignId = req.body.campaignId || (req.query.campaignId as string);
    const asset = await assetService.generateAsset(campaignId, req.body);

    res.status(201).json({
      success: true,
      data: asset,
    });
  })
);

/**
 * POST /api/v1/assets/batch
 * Batch generate assets
 */
router.post(
  '/batch',
  validateRequest({ body: batchAssetGenerationSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const results = await assetService.batchGenerateAssets(req.body);

    res.status(201).json({
      success: true,
      data: results,
    });
  })
);

/**
 * POST /api/v1/assets
 * Create asset manually
 */
router.post(
  '/',
  validateRequest({ body: createAssetRequestSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const asset = await assetService.createAsset(userId, req.body);

    res.status(201).json({
      success: true,
      data: asset,
    });
  })
);

/**
 * GET /api/v1/assets
 * List user assets
 */
router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const { campaignId, type, status, page, pageSize } = req.query;

    const assets = await assetService.listAssets(userId, campaignId as string, {
      type: type as string | undefined,
      status: status as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: assets,
    });
  })
);

/**
 * GET /api/v1/assets/:id
 * Get asset details
 */
router.get(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const assetId = req.params.id;

    const asset = await assetService.getAsset(assetId, userId);

    res.status(200).json({
      success: true,
      data: asset,
    });
  })
);

/**
 * PUT /api/v1/assets/:id
 * Update asset
 */
router.put(
  '/:id',
  validateRequest({ body: updateAssetRequestSchema.partial() }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const assetId = req.params.id;

    const asset = await assetService.updateAsset(assetId, userId, req.body);

    res.status(200).json({
      success: true,
      data: asset,
    });
  })
);

/**
 * DELETE /api/v1/assets/:id
 * Delete asset
 */
router.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const assetId = req.params.id;

    await assetService.deleteAsset(assetId, userId);

    res.status(200).json({
      success: true,
      data: { message: 'Asset deleted successfully' },
    });
  })
);

export default router;

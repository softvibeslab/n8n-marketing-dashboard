/**
 * ===========================================
 * Workflow Routes
 * ===========================================
 */

import { Router, Request } from 'express';
import { workflowService } from '../services/workflow.service';
import { validateRequest } from '../middleware/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import {
  workflowGenerationRequestSchema,
  workflowDeploymentRequestSchema,
  workflowExecutionRequestSchema,
} from '../schemas/workflow.schema';

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
 * POST /api/v1/workflows/generate
 * Generate workflow from natural language
 */
router.post(
  '/generate',
  validateRequest({ body: workflowGenerationRequestSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const workflow = await workflowService.generateWorkflow(userId, req.body);

    res.status(201).json({
      success: true,
      data: workflow,
    });
  })
);

/**
 * GET /api/v1/workflows
 * List user workflows
 */
router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const { status, page, pageSize } = req.query;

    const workflows = await workflowService.listWorkflows(userId, {
      status: status as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: workflows,
    });
  })
);

/**
 * GET /api/v1/workflows/:id
 * Get workflow details
 */
router.get(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const workflowId = req.params.id;

    const workflow = await workflowService.getWorkflow(workflowId, userId);

    res.status(200).json({
      success: true,
      data: workflow,
    });
  })
);

/**
 * PUT /api/v1/workflows/:id
 * Update workflow
 */
router.put(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const workflowId = req.params.id;

    const workflow = await workflowService.updateWorkflow(workflowId, userId, req.body);

    res.status(200).json({
      success: true,
      data: workflow,
    });
  })
);

/**
 * DELETE /api/v1/workflows/:id
 * Delete workflow
 */
router.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const workflowId = req.params.id;

    await workflowService.deleteWorkflow(workflowId, userId);

    res.status(200).json({
      success: true,
      data: { message: 'Workflow deleted successfully' },
    });
  })
);

/**
 * POST /api/v1/workflows/:id/deploy
 * Deploy workflow to n8n
 */
router.post(
  '/:id/deploy',
  validateRequest({ body: workflowDeploymentRequestSchema.partial() }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const workflowId = req.params.id;

    const result = await workflowService.deployWorkflow(workflowId, userId, req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  })
);

/**
 * POST /api/v1/workflows/:id/execute
 * Execute workflow
 */
router.post(
  '/:id/execute',
  validateRequest({ body: workflowExecutionRequestSchema.partial() }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const workflowId = req.params.id;

    const execution = await workflowService.executeWorkflow(workflowId, userId, req.body);

    res.status(200).json({
      success: true,
      data: execution,
    });
  })
);

/**
 * GET /api/v1/workflows/:id/validate
 * Validate workflow
 */
router.get(
  '/:id/validate',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const workflowId = req.params.id;

    const validation = await workflowService.validateWorkflow(workflowId, userId);

    res.status(200).json({
      success: true,
      data: validation,
    });
  })
);

/**
 * GET /api/v1/workflows/:id/versions
 * Get workflow version history
 */
router.get(
  '/:id/versions',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const workflowId = req.params.id;

    const versions = await workflowService.getVersionHistory(workflowId, userId);

    res.status(200).json({
      success: true,
      data: versions,
    });
  })
);

/**
 * POST /api/v1/workflows/:id/versions/:version/restore
 * Restore workflow from version
 */
router.post(
  '/:id/versions/:version/restore',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const workflowId = req.params.id;
    const version = parseInt(req.params.version);

    const workflow = await workflowService.restoreVersion(workflowId, userId, version);

    res.status(200).json({
      success: true,
      data: workflow,
    });
  })
);

export default router;

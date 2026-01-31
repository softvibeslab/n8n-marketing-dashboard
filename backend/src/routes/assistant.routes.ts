/**
 * ===========================================
 * Assistant Routes
 * ===========================================
 */

import { Router, Request } from 'express';
import { assistantService } from '../services/assistant.service';
import { validateRequest } from '../middleware/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import { sendMessageSchema, chatActionSchema } from '../schemas/assistant.schema';

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
 * POST /api/v1/assistant/chat
 * Send message to assistant
 */
router.post(
  '/chat',
  validateRequest({ body: sendMessageSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const result = await assistantService.sendMessage(userId, req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  })
);

/**
 * POST /api/v1/assistant/actions
 * Execute chat action
 */
router.post(
  '/actions',
  validateRequest({ body: chatActionSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const result = await assistantService.executeChatAction(userId, req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  })
);

/**
 * GET /api/v1/assistant/conversations
 * List conversations
 */
router.get(
  '/conversations',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const { page, pageSize } = req.query;

    const conversations = await assistantService.listConversations(userId, {
      page: page ? parseInt(page as string) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: conversations,
    });
  })
);

/**
 * GET /api/v1/assistant/conversations/:id
 * Get conversation history
 */
router.get(
  '/conversations/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const conversationId = req.params.id;

    const conversation = await assistantService.getConversation(conversationId, userId);

    res.status(200).json({
      success: true,
      data: conversation,
    });
  })
);

/**
 * DELETE /api/v1/assistant/conversations/:id
 * Delete conversation
 */
router.delete(
  '/conversations/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const conversationId = req.params.id;

    await assistantService.deleteConversation(conversationId, userId);

    res.status(200).json({
      success: true,
      data: { message: 'Conversation deleted' },
    });
  })
);

export default router;

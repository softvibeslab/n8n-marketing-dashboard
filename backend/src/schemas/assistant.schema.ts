/**
 * ===========================================
 * Assistant Validation Schemas
 * ===========================================
 */

import { z } from 'zod';

/**
 * Chat Message Schema
 */
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Conversation Schema
 */
export const conversationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  title: z.string().max(200).optional(),
  messages: z.array(chatMessageSchema),
  context: z.record(z.unknown()).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

/**
 * Send Message Schema
 */
export const sendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(5000),
  context: z.record(z.unknown()).optional(),
  voiceInput: z.boolean().default(false),
});

/**
 * Generate Workflow from Chat Schema
 */
export const generateWorkflowFromChatSchema = z.object({
  conversationId: z.string().uuid(),
  workflowName: z.string().min(1).max(200),
  confirm: z.boolean().default(false),
});

/**
 * Chat Action Schema
 */
export const chatActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('generate_workflow'),
    workflowName: z.string().min(1).max(200),
  }),
  z.object({
    type: z.literal('create_asset'),
    assetType: z.enum(['TEXT', 'IMAGE']),
    prompt: z.string(),
  }),
  z.object({
    type: z.literal('execute_workflow'),
    workflowId: z.string().uuid(),
  }),
  z.object({
    type: z.literal('get_analytics'),
    campaignId: z.string().uuid(),
  }),
]);

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type SendMessage = z.infer<typeof sendMessageSchema>;
export type GenerateWorkflowFromChat = z.infer<typeof generateWorkflowFromChatSchema>;
export type ChatAction = z.infer<typeof chatActionSchema>;

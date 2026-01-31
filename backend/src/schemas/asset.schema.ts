/**
 * ===========================================
 * Asset Validation Schemas
 * ===========================================
 */

import { z } from 'zod';

/**
 * Text Asset Generation Schema
 */
export const textAssetGenerationSchema = z.object({
  type: z.literal('TEXT'),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  tone: z.string().optional(),
  maxLength: z.number().positive().optional(),
  keywords: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
});

/**
 * Image Asset Generation Schema
 */
export const imageAssetGenerationSchema = z.object({
  type: z.literal('IMAGE'),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  style: z.string().optional(),
  dimensions: z
    .object({
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
  numberOfImages: z.number().int().min(1).max(10).default(1),
  quality: z.enum(['standard', 'hd']).default('standard'),
});

/**
 * Asset Generation Request Schema (Union)
 */
export const assetGenerationRequestSchema = z.discriminatedUnion('type', [
  textAssetGenerationSchema,
  imageAssetGenerationSchema,
]);

/**
 * Asset Create Request Schema
 */
export const createAssetRequestSchema = z.object({
  campaignId: z.string().uuid(),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'DESIGN']),
  content: z.string().optional(),
  fileUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
  isAIGenerated: z.boolean().default(false),
});

/**
 * Asset Update Request Schema
 */
export const updateAssetRequestSchema = z.object({
  content: z.string().optional(),
  fileUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
  status: z.enum(['DRAFT', 'GENERATED', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).optional(),
});

/**
 * Batch Asset Generation Schema
 */
export const batchAssetGenerationSchema = z.object({
  campaignId: z.string().uuid(),
  assets: z.array(assetGenerationRequestSchema).min(1).max(10),
  templateId: z.string().optional(),
});

/**
 * Asset Template Schema
 */
export const assetTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string(),
  assetType: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'DESIGN']),
  template: z.record(z.unknown()),
  isSystem: z.boolean().default(false),
});

export type TextAssetGeneration = z.infer<typeof textAssetGenerationSchema>;
export type ImageAssetGeneration = z.infer<typeof imageAssetGenerationSchema>;
export type AssetGenerationRequest = z.infer<typeof assetGenerationRequestSchema>;
export type CreateAssetRequest = z.infer<typeof createAssetRequestSchema>;
export type UpdateAssetRequest = z.infer<typeof updateAssetRequestSchema>;
export type BatchAssetGeneration = z.infer<typeof batchAssetGenerationSchema>;
export type AssetTemplate = z.infer<typeof assetTemplateSchema>;

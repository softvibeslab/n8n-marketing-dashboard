/**
 * ===========================================
 * Workflow Validation Schemas
 * ===========================================
 */

import { z } from 'zod';

/**
 * n8n Node Parameter Schema
 */
export const n8nNodeParameterSchema = z.record(z.unknown());

/**
 * n8n Node Position Schema
 */
export const n8nNodePositionSchema = z.tuple([z.number(), z.number()]);

/**
 * n8n Node Schema
 */
export const n8nNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  parameters: n8nNodeParameterSchema.optional().default({}),
  position: n8nNodePositionSchema,
  typeVersion: z.number().optional(),
  notes: z.string().optional(),
});

/**
 * n8n Connection Schema
 */
export const n8nConnectionSchema = z.object({
  index: z.number(),
  type: z.string().optional(),
  node: z.string(),
  typeData: z.unknown().optional(),
});

/**
 * n8n Workflow Schema
 */
export const n8nWorkflowSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(200),
  nodes: z.array(n8nNodeSchema).min(1),
  connections: z.record(z.string(), z.array(z.array(n8nConnectionSchema))),
  settings: z
    .object({
      executionOrder: z.string().optional(),
      saveData: z.boolean().optional(),
      saveManualExecutions: z.boolean().optional(),
    })
    .optional(),
  staticData: z.record(z.unknown()).optional(),
  tags: z.array(z.unknown()).optional(),
});

/**
 * Workflow Generation Request Schema
 */
export const workflowGenerationRequestSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  naturalLanguageInput: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description too long'),
  strategyId: z.string().uuid().optional(),
  campaignId: z.string().uuid().optional(),
  templateId: z.string().optional(),
});

/**
 * Workflow Validation Response Schema
 */
export const workflowValidationResponseSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  nodes: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      isValid: z.boolean(),
      errors: z.array(z.string()),
    })
  ),
  connections: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      isValid: z.boolean(),
      errors: z.array(z.string()),
    })
  ),
});

/**
 * Workflow Deployment Request Schema
 */
export const workflowDeploymentRequestSchema = z.object({
  workflowId: z.string().uuid(),
  deployToN8n: z.boolean().default(true),
  activate: z.boolean().default(false),
});

/**
 * Workflow Execution Request Schema
 */
export const workflowExecutionRequestSchema = z.object({
  workflowId: z.string().uuid(),
  inputData: z.record(z.unknown()).optional(),
});

/**
 * Workflow Node Type Schema
 */
export const workflowNodeTypeSchema = z.object({
  type: z.string(),
  category: z.enum([
    'trigger',
    'action',
    'logic',
    'data',
    'integration',
    'automation',
    'ai',
  ]),
  description: z.string(),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
  parameters: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean().default(false),
      description: z.string().optional(),
    })
  ),
});

export type N8nNode = z.infer<typeof n8nNodeSchema>;
export type N8nConnection = z.infer<typeof n8nConnectionSchema>;
export type N8nWorkflow = z.infer<typeof n8nWorkflowSchema>;
export type WorkflowGenerationRequest = z.infer<typeof workflowGenerationRequestSchema>;
export type WorkflowValidationResponse = z.infer<typeof workflowValidationResponseSchema>;
export type WorkflowDeploymentRequest = z.infer<typeof workflowDeploymentRequestSchema>;
export type WorkflowExecutionRequest = z.infer<typeof workflowExecutionRequestSchema>;
export type WorkflowNodeType = z.infer<typeof workflowNodeTypeSchema>;

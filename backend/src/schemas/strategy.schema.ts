/**
 * ===========================================
 * Strategy Validation Schemas
 * ===========================================
 */

import { z } from 'zod';

/**
 * Target Audience Schema
 */
export const targetAudienceSchema = z.object({
  ageRange: z.string().optional(),
  interests: z.array(z.string()).optional().default([]),
  location: z.string().optional(),
  gender: z.string().optional(),
  language: z.string().optional(),
  incomeLevel: z.string().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
});

/**
 * Timeline Schema
 */
export const timelineSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  milestones: z
    .array(
      z.object({
        date: z.string().datetime(),
        description: z.string(),
      })
    )
    .optional()
    .default([]),
});

/**
 * Marketing Channel Schema
 */
export const marketingChannelSchema = z.object({
  name: z.string(),
  budget: z.number().nonnegative().optional(),
  targetKPI: z.string().optional(),
  isActive: z.boolean().default(true),
});

/**
 * Budget Allocation Schema
 */
export const budgetAllocationSchema = z.record(z.string(), z.number().nonnegative());

/**
 * Campaign Goal Schema
 */
export const campaignGoalSchema = z.object({
  goal: z.string(),
  metric: z.string(),
  targetValue: z.number().nonnegative(),
  currentValue: z.number().nonnegative().optional(),
  deadline: z.string().datetime().optional(),
});

/**
 * Strategy Input Schema (Complete)
 */
export const strategyInputSchema = z.object({
  targetAudience: targetAudienceSchema,
  campaignGoals: z.array(campaignGoalSchema).min(1, 'At least one campaign goal is required'),
  marketingChannels: z.array(marketingChannelSchema).min(1, 'At least one marketing channel is required'),
  budgetAllocation: budgetAllocationSchema.optional(),
  timeline: timelineSchema.optional(),
  brandGuidelines: z
    .object({
      tone: z.string().optional(),
      colors: z.array(z.string()).optional(),
      fonts: z.array(z.string()).optional(),
      logoUrl: z.string().url().optional(),
    })
    .optional(),
  additionalNotes: z.string().optional(),
});

/**
 * Strategy Create Request Schema
 */
export const createStrategyRequestSchema = z.object({
  name: z.string().min(1, 'Strategy name is required').max(200),
  description: z.string().optional(),
  strategy: strategyInputSchema,
  workflowId: z.string().uuid().optional(),
});

/**
 * Strategy Update Request Schema
 */
export const updateStrategyRequestSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  strategy: strategyInputSchema.partial().optional(),
});

/**
 * Strategy Analysis Response Schema
 */
export const strategyAnalysisResponseSchema = z.object({
  insights: z.array(z.string()),
  suggestions: z.array(
    z.object({
      category: z.string(),
      suggestion: z.string(),
      priority: z.enum(['low', 'medium', 'high']),
      estimatedImpact: z.string().optional(),
    })
  ),
  recommendedChannels: z.array(z.string()),
  budgetOptimization: z
    .object({
      recommendations: z.array(z.string()),
      totalEstimatedBudget: z.number().nonnegative(),
      potentialSavings: z.number().nonnegative().optional(),
    })
    .optional(),
  riskAssessment: z
    .object({
      risks: z.array(z.string()),
      mitigations: z.array(z.string()),
    })
    .optional(),
});

/**
 * Strategy Template Schema
 */
export const strategyTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string(),
  template: strategyInputSchema,
  isSystem: z.boolean().default(false),
});

export type TargetAudience = z.infer<typeof targetAudienceSchema>;
export type Timeline = z.infer<typeof timelineSchema>;
export type MarketingChannel = z.infer<typeof marketingChannelSchema>;
export type BudgetAllocation = z.infer<typeof budgetAllocationSchema>;
export type CampaignGoal = z.infer<typeof campaignGoalSchema>;
export type StrategyInput = z.infer<typeof strategyInputSchema>;
export type CreateStrategyRequest = z.infer<typeof createStrategyRequestSchema>;
export type UpdateStrategyRequest = z.infer<typeof updateStrategyRequestSchema>;
export type StrategyAnalysisResponse = z.infer<typeof strategyAnalysisResponseSchema>;
export type StrategyTemplate = z.infer<typeof strategyTemplateSchema>;

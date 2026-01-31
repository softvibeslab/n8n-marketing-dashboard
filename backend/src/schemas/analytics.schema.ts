/**
 * ===========================================
 * Analytics Validation Schemas
 * ===========================================
 */

import { z } from 'zod';

/**
 * Analytics Metrics Schema
 */
export const analyticsMetricsSchema = z.object({
  source: z.string(),
  metrics: z.record(z.unknown()),
  fetchedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});

/**
 * Campaign Metrics Schema
 */
export const campaignMetricsSchema = z.object({
  campaignId: z.string().uuid(),
  period: z.enum(['7d', '30d', '90d', 'custom']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  metrics: z.object({
    impressions: z.number().nonnegative().optional(),
    clicks: z.number().nonnegative().optional(),
    conversions: z.number().nonnegative().optional(),
    spend: z.number().nonnegative().optional(),
    revenue: z.number().nonnegative().optional(),
    ctr: z.number().nonnegative().optional(), // Click-through rate
    cpc: z.number().nonnegative().optional(), // Cost per click
    cpa: z.number().nonnegative().optional(), // Cost per acquisition
    roi: z.number().optional(), // Return on investment
  }),
  breakdown: z.enum(['day', 'week', 'month', 'channel']).optional(),
});

/**
 * Platform Analytics Schema
 */
export const platformAnalyticsSchema = z.object({
  platform: z.enum(['google-analytics', 'facebook', 'instagram', 'twitter', 'linkedin', 'mailchimp']),
  campaignId: z.string().uuid().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  metrics: z.array(z.string()),
  dimensions: z.array(z.string()).optional(),
});

/**
 * Report Generation Schema
 */
export const reportGenerationSchema = z.object({
  campaignId: z.string().uuid(),
  reportType: z.enum(['performance', 'comparison', 'trend', 'custom']),
  format: z.enum(['pdf', 'csv', 'json']),
  period: z.enum(['7d', '30d', '90d', 'custom']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  includeCharts: z.boolean().default(true),
  includeInsights: z.boolean().default(true),
});

/**
 * AI Insights Request Schema
 */
export const aiInsightsRequestSchema = z.object({
  campaignId: z.string().uuid(),
  metrics: z.record(z.unknown()),
  goals: z.array(z.object({
    metric: z.string(),
    target: z.number(),
    current: z.number(),
  })),
  context: z.string().optional(),
});

/**
 * Real-time Analytics Subscription Schema
 */
export const realtimeSubscriptionSchema = z.object({
  campaignId: z.string().uuid(),
  metrics: z.array(z.enum(['impressions', 'clicks', 'conversions', 'revenue', 'spend'])),
  refreshInterval: z.number().int().min(5).max(300).default(30), // seconds
});

export type AnalyticsMetrics = z.infer<typeof analyticsMetricsSchema>;
export type CampaignMetrics = z.infer<typeof campaignMetricsSchema>;
export type PlatformAnalytics = z.infer<typeof platformAnalyticsSchema>;
export type ReportGeneration = z.infer<typeof reportGenerationSchema>;
export type AIInsightsRequest = z.infer<typeof aiInsightsRequestSchema>;
export type RealtimeSubscription = z.infer<typeof realtimeSubscriptionSchema>;

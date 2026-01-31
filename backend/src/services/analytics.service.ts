/**
 * ===========================================
 * Analytics Service
 * ===========================================
 */

import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { aiService } from './ai.service';
import type {
  CampaignMetrics,
  PlatformAnalytics,
  ReportGeneration,
  AIInsightsRequest,
} from '../schemas';

/**
 * Analytics Service for campaign performance tracking
 */
class AnalyticsService {
  /**
   * Get campaign metrics
   */
  async getCampaignMetrics(campaignId: string, request: CampaignMetrics, userId: string) {
    try {
      logger.info('Getting campaign metrics', { campaignId, period: request.period });

      // Verify campaign ownership
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          userId,
        },
      });

      if (!campaign) {
        throw new Error('Campaign not found or access denied');
      }

      // Calculate date range
      const { startDate, endDate } = this.getDateRange(request.period, request.startDate, request.endDate);

      // Get cached metrics if available
      const cached = await prisma.analyticsCache.findFirst({
        where: {
          campaignId,
          source: 'combined',
          expiresAt: {
            gte: new Date(),
          },
        },
      });

      if (cached) {
        logger.info('Returning cached metrics', { campaignId });
        return cached.metrics as any;
      }

      // Aggregate metrics from all sources
      const metrics = await this.aggregateMetrics(campaignId, startDate, endDate, request.breakdown);

      // Cache the results for 5 minutes
      await prisma.analyticsCache.create({
        data: {
          campaignId,
          source: 'combined',
          metrics: metrics as any,
          fetchedAt: new Date(),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        },
      });

      logger.info('Campaign metrics retrieved', { campaignId });

      return metrics;
    } catch (error) {
      logger.error('Failed to get campaign metrics', { error });
      throw error;
    }
  }

  /**
   * Fetch platform analytics
   */
  async fetchPlatformAnalytics(request: PlatformAnalytics, userId: string) {
    try {
      logger.info('Fetching platform analytics', { platform: request.platform });

      // In a real implementation, this would call the actual platform APIs
      // For now, we'll return mock data based on the platform

      const metrics = await this.getMockPlatformMetrics(request.platform, request);

      logger.info('Platform analytics fetched', { platform: request.platform });

      return metrics;
    } catch (error) {
      logger.error('Failed to fetch platform analytics', { error });
      throw error;
    }
  }

  /**
   * Generate AI insights
   */
  async generateAIInsights(campaignId: string, request: AIInsightsRequest, userId: string) {
    try {
      logger.info('Generating AI insights', { campaignId });

      // Verify campaign ownership
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          userId,
        },
        include: {
          assets: true,
          workflow: true,
        },
      });

      if (!campaign) {
        throw new Error('Campaign not found or access denied');
      }

      // Build prompt for AI analysis
      const prompt = this.buildInsightsPrompt(campaign, request);

      const response = await aiService.getClient().chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert marketing analyst. Provide actionable insights and recommendations based on campaign performance data.
Respond in JSON format with insights, recommendations, and priority levels.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty AI response');
      }

      const insights = JSON.parse(content);

      logger.info('AI insights generated', { campaignId });

      return insights;
    } catch (error) {
      logger.error('Failed to generate AI insights', { error });
      throw new Error(`AI insights generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate report
   */
  async generateReport(campaignId: string, request: ReportGeneration, userId: string) {
    try {
      logger.info('Generating report', { campaignId, type: request.reportType, format: request.format });

      // Verify campaign ownership
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          userId,
        },
        include: {
          assets: true,
        },
      });

      if (!campaign) {
        throw new Error('Campaign not found or access denied');
      }

      // Get metrics for the period
      const { startDate, endDate } = this.getDateRange(request.period, request.startDate, request.endDate);

      const metrics = await this.aggregateMetrics(campaignId, startDate, endDate, 'day');

      // Generate AI insights if requested
      let insights = null;
      if (request.includeInsights) {
        insights = await this.generateAIInsights(campaignId, {
          metrics,
          goals: [], // Would be populated from campaign goals
          campaignId,
        }, userId);
      }

      // Build report data
      const reportData = {
        campaign: {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          status: campaign.status,
        },
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        metrics,
        insights,
        generatedAt: new Date().toISOString(),
      };

      // In a real implementation, generate PDF/CSV
      // For now, return the data
      logger.info('Report generated', { campaignId, format: request.format });

      return reportData;
    } catch (error) {
      logger.error('Report generation failed', { error });
      throw error;
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealtimeMetrics(campaignId: string, userId: string) {
    try {
      // Verify campaign ownership
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          userId,
        },
      });

      if (!campaign) {
        throw new Error('Campaign not found or access denied');
      }

      // Get recent executions from workflow
      const recentExecutions = await prisma.execution.findMany({
        where: {
          workflow: {
            campaigns: {
              some: {
                id: campaignId,
              },
            },
          },
          startedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        orderBy: {
          startedAt: 'desc',
        },
        take: 100,
      });

      // Calculate real-time metrics
      const metrics = {
        executions: {
          total: recentExecutions.length,
          success: recentExecutions.filter((e) => e.status === 'SUCCESS').length,
          failed: recentExecutions.filter((e) => e.status === 'FAILED').length,
          running: recentExecutions.filter((e) => e.status === 'RUNNING').length,
        },
        timeline: this.getExecutionTimeline(recentExecutions),
      };

      return metrics;
    } catch (error) {
      logger.error('Failed to get real-time metrics', { error });
      throw error;
    }
  }

  /**
   * Aggregate metrics from all sources
   */
  private async aggregateMetrics(
    campaignId: string,
    startDate: Date,
    endDate: Date,
    breakdown?: string
  ) {
    // Mock implementation - in production, this would query actual data sources
    const baseMetrics = {
      impressions: Math.floor(Math.random() * 100000) + 50000,
      clicks: Math.floor(Math.random() * 5000) + 2000,
      conversions: Math.floor(Math.random() * 500) + 100,
      spend: Math.floor(Math.random() * 5000) + 1000,
      revenue: Math.floor(Math.random() * 20000) + 5000,
    };

    const metrics = {
      ...baseMetrics,
      ctr: (baseMetrics.clicks / baseMetrics.impressions) * 100,
      cpc: baseMetrics.spend / baseMetrics.clicks,
      cpa: baseMetrics.spend / baseMetrics.conversions,
      roi: ((baseMetrics.revenue - baseMetrics.spend) / baseMetrics.spend) * 100,
    };

    // Add breakdown if requested
    if (breakdown) {
      const breakdownData = this.generateBreakdown(metrics, breakdown, startDate, endDate);
      return {
        summary: metrics,
        breakdown: breakdownData,
      };
    }

    return metrics;
  }

  /**
   * Generate breakdown data
   */
  private generateBreakdown(metrics: any, breakdown: string, startDate: Date, endDate: Date) {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (breakdown === 'day') {
      return Array.from({ length: days }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        return {
          date: date.toISOString().split('T')[0],
          ...metrics,
          impressions: Math.floor(metrics.impressions / days),
          clicks: Math.floor(metrics.clicks / days),
        };
      });
    }

    return [];
  }

  /**
   * Get mock platform metrics
   */
  private async getMockPlatformMetrics(platform: string, request: PlatformAnalytics) {
    // In production, this would call the actual platform APIs
    const baseMetrics = {
      impressions: Math.floor(Math.random() * 50000) + 10000,
      clicks: Math.floor(Math.random() * 2000) + 500,
      spend: Math.floor(Math.random() * 1000) + 200,
    };

    return {
      platform,
      period: {
        from: request.startDate,
        to: request.endDate,
      },
      metrics: baseMetrics,
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ...baseMetrics,
        impressions: Math.floor(baseMetrics.impressions / 30),
        clicks: Math.floor(baseMetrics.clicks / 30),
      })),
    };
  }

  /**
   * Build insights prompt
   */
  private buildInsightsPrompt(campaign: any, request: AIInsightsRequest): string {
    let prompt = `Analyze this marketing campaign performance and provide insights:\n\n`;
    prompt += `Campaign: ${campaign.name}\n`;
    prompt += `Description: ${campaign.description || 'No description'}\n\n`;

    prompt += `Current Metrics:\n`;
    prompt += JSON.stringify(request.metrics, null, 2);

    if (request.goals && request.goals.length > 0) {
      prompt += `\n\nGoals:\n`;
      request.goals.forEach((goal: { metric: string; target: number; current: number }, index: number) => {
        const progress = (goal.current / goal.target) * 100;
        prompt += `${index + 1}. ${goal.metric}: ${progress.toFixed(1)}% of target (${goal.current}/${goal.target})\n`;
      });
    }

    prompt += `\n\nProvide:\n`;
    prompt += `1. Key performance insights\n`;
    prompt += `2. Areas for improvement\n`;
    prompt += `3. Specific recommendations with priority (high/medium/low)\n`;
    prompt += `4. Potential optimizations\n`;

    return prompt;
  }

  /**
   * Get date range from period
   */
  private getDateRange(period: string, startDate?: string, endDate?: string) {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (startDate && endDate) {
      return {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
    }

    switch (period) {
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate: start, endDate: end };
  }

  /**
   * Get execution timeline
   */
  private getExecutionTimeline(executions: any[]) {
    const timeline: Record<string, number> = {};

    executions.forEach((execution) => {
      const hour = new Date(execution.startedAt).getHours();
      timeline[hour] = (timeline[hour] || 0) + 1;
    });

    return Object.entries(timeline)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.hour - b.hour);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

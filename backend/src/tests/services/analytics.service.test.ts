/**
 * ===========================================
 * Analytics Service Tests
 * ===========================================
 */

import { describe, it, expect, beforeEach, vi } from '@jest/globals';
import { analyticsService } from '../../services/analytics.service';
import { aiService } from '../../services/ai.service';
import { workflowService } from '../../services/workflow.service';

// Mock dependencies
vi.mock('../../utils/prisma', () => ({
  prisma: {
    campaign: {
      findFirst: vi.fn(),
    },
    execution: {
      findMany: vi.fn(),
    },
    analyticsCache: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    workflow: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../../services/ai.service');
vi.mock('../../services/workflow.service');

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCampaignMetrics', () => {
    it('should return cached metrics if available', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.campaign.findFirst).mockResolvedValue({
        id: 'campaign-123',
        name: 'Test Campaign',
      });

      const cachedMetrics = {
        source: 'combined',
        metrics: { impressions: 10000, clicks: 500 },
        fetchedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      };

      vi.mocked(prisma.analyticsCache.findFirst).mockResolvedValue(cachedMetrics);

      const result = await analyticsService.getCampaignMetrics(
        'campaign-123',
        { period: '30d' },
        'user-123'
      );

      expect(result).toEqual(cachedMetrics.metrics);
      expect(prisma.analyticsCache.create).not.toHaveBeenCalled();
    });

    it('should aggregate metrics when no cache exists', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.campaign.findFirst).mockResolvedValue({
        id: 'campaign-123',
        name: 'Test Campaign',
      });

      vi.mocked(prisma.analyticsCache.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.analyticsCache.create).mockResolvedValue({});

      const result = await analyticsService.getCampaignMetrics(
        'campaign-123',
        { period: '30d' },
        'user-123'
      );

      expect(result).toHaveProperty('impressions');
      expect(prisma.analyticsCache.create).toHaveBeenCalled();
    });
  });

  describe('fetchPlatformAnalytics', () => {
    it('should return mock platform metrics', async () => {
      const request = {
        platform: 'facebook' as const,
        campaignId: 'campaign-123',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        metrics: ['impressions', 'clicks', 'spend'],
      };

      const result = await analyticsService.fetchPlatformAnalytics(request, 'user-123');

      expect(result).toHaveProperty('platform', 'facebook');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('data');
    });
  });

  describe('generateAIInsights', () => {
    it('should generate AI-powered insights', async () => {
      const { prisma } = require('../../utils/prisma');

      const mockCampaign = {
        id: 'campaign-123',
        name: 'Summer Sale',
        description: 'Summer promotional campaign',
        assets: [],
        workflow: null,
      };

      vi.mocked(prisma.campaign.findFirst).mockResolvedValue(mockCampaign);

      vi.mocked(aiService.getClient().chat.completions.create).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                insights: ['CTR is above average', 'Consider increasing ad spend'],
                recommendations: [
                  {
                    category: 'Optimization',
                    recommendation: 'Increase budget on top-performing channels',
                    priority: 'high' as const,
                  },
                ],
              }),
            },
          },
        ],
      });

      const request = {
        campaignId: 'campaign-123',
        metrics: { ctr: 3.5, cpc: 1.2 },
        goals: [
          { metric: 'conversions', target: 100, current: 45 },
        ],
      };

      const result = await analyticsService.generateAIInsights('campaign-123', request, 'user-123');

      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('recommendations');
      expect(result.insights).toBeInstanceOf(Array);
    });
  });

  describe('generateReport', () => {
    it('should generate campaign report', async () => {
      const { prisma } = require('../../utils/prisma');

      const mockCampaign = {
        id: 'campaign-123',
        name: 'Summer Sale',
        status: 'ACTIVE',
        assets: [],
      };

      vi.mocked(prisma.campaign.findFirst).mockResolvedValue(mockCampaign);

      const request = {
        campaignId: 'campaign-123',
        reportType: 'performance' as const,
        format: 'json' as const,
        period: '30d' as const,
        includeCharts: true,
        includeInsights: false,
      };

      const result = await analyticsService.generateReport(
        'campaign-123',
        request,
        'user-123'
      );

      expect(result).toHaveProperty('campaign');
      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('metrics');
    });
  });

  describe('getRealtimeMetrics', () => {
    it('should get real-time execution metrics', async () => {
      const { prisma } = require('../../utils/prisma');

      const mockExecutions = [
        {
          id: 'exec-1',
          status: 'SUCCESS',
          startedAt: new Date(Date.now() - 3600000),
        },
        {
          id: 'exec-2',
          status: 'RUNNING',
          startedAt: new Date(Date.now() - 60000),
        },
        {
          id: 'exec-3',
          status: 'FAILED',
          startedAt: new Date(Date.now() - 7200000),
        },
      ];

      vi.mocked(prisma.campaign.findFirst).mockResolvedValue({
        id: 'campaign-123',
        workflow: {
          executions: [], // Will be populated by prisma.execution.findMany
        },
      });

      vi.mocked(prisma.execution.findMany).mockResolvedValue(mockExecutions);

      const result = await analyticsService.getRealtimeMetrics('campaign-123', 'user-123');

      expect(result).toHaveProperty('executions');
      expect(result.executions).toEqual({
        total: 3,
        success: 1,
        failed: 1,
        running: 1,
      });
      expect(result).toHaveProperty('timeline');
    });
  });
});

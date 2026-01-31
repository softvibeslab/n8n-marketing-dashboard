/**
 * ===========================================
 * Strategy Service Tests
 * ===========================================
 */

import { describe, it, expect, beforeEach, vi } from '@jest/globals';
import { strategyService } from '../../services/strategy.service';
import { aiService } from '../../services/ai.service';

// Mock dependencies
vi.mock('../../utils/prisma', () => ({
  prisma: {
    campaign: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    strategyTemplate: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../../services/ai.service');

describe('StrategyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeStrategy', () => {
    it('should analyze strategy with AI', async () => {
      const { prisma } = require('../../utils/prisma');
      const strategy = {
        targetAudience: {
          ageRange: '25-45',
          interests: ['Technology'],
        },
        campaignGoals: [{ goal: 'Increase awareness', metric: 'impressions', targetValue: 10000 }],
        marketingChannels: [{ name: 'Social Media', isActive: true }],
      };

      const mockAnalysis = {
        insights: ['Good target audience definition'],
        suggestions: [
          {
            category: 'Channels',
            suggestion: 'Add email marketing',
            priority: 'medium' as const,
          },
        ],
        recommendedChannels: ['Social Media', 'Email'],
      };

      vi.mocked(aiService.analyzeStrategy).mockResolvedValue(mockAnalysis);

      const result = await strategyService.analyzeStrategy(strategy);

      expect(result).toEqual(mockAnalysis);
      expect(aiService.analyzeStrategy).toHaveBeenCalledWith(strategy);
    });

    it('should handle AI errors', async () => {
      const strategy = {
        targetAudience: {},
        campaignGoals: [],
        marketingChannels: [],
      };

      vi.mocked(aiService.analyzeStrategy).mockRejectedValue(new Error('AI Error'));

      await expect(strategyService.analyzeStrategy(strategy)).rejects.toThrow('AI Error');
    });
  });

  describe('createCampaign', () => {
    it('should create campaign with strategy', async () => {
      const { prisma } = require('../../utils/prisma');
      const userId = 'user-123';
      const request = {
        name: 'Test Campaign',
        description: 'Test description',
        strategy: {
          targetAudience: {},
          campaignGoals: [],
          marketingChannels: [],
        },
      };

      const mockCampaign = {
        id: 'campaign-123',
        name: 'Test Campaign',
        userId,
        status: 'DRAFT',
      };

      vi.mocked(prisma.campaign.create).mockResolvedValue(mockCampaign);

      const result = await strategyService.createCampaign(userId, request as any);

      expect(result).toEqual(mockCampaign);
      expect(prisma.campaign.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Campaign',
          userId,
        }),
      });
    });

    it('should handle database errors', async () => {
      const { prisma } = require('../../utils/prisma');
      const userId = 'user-123';
      const request = {
        name: 'Test Campaign',
        strategy: {
          targetAudience: {},
          campaignGoals: [],
          marketingChannels: [],
        },
      };

      vi.mocked(prisma.campaign.create).mockRejectedValue(new Error('Database error'));

      await expect(strategyService.createCampaign(userId, request as any)).rejects.toThrow(
        'Failed to create campaign'
      );
    });
  });

  describe('listCampaigns', () => {
    it('should list campaigns for user', async () => {
      const { prisma } = require('../../utils/prisma');
      const mockCampaigns = [
        { id: 'campaign-1', name: 'Campaign 1' },
        { id: 'campaign-2', name: 'Campaign 2' },
      ];

      vi.mocked(prisma.campaign.findMany).mockResolvedValue(mockCampaigns);
      vi.mocked(prisma.campaign.count).mockResolvedValue(2);

      const result = await strategyService.listCampaigns('user-123');

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total');
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by status', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.campaign.findMany).mockResolvedValue([]);
      vi.mocked(prisma.campaign.count).mockResolvedValue(0);

      await strategyService.listCampaigns('user-123', { status: 'ACTIVE' });

      expect(prisma.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });

    it('should paginate results', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.campaign.findMany).mockResolvedValue([]);
      vi.mocked(prisma.campaign.count).mockResolvedValue(0);

      await strategyService.listCampaigns('user-123', { page: 2, pageSize: 10 });

      expect(prisma.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });
  });

  describe('getTemplates', () => {
    it('should get all templates', async () => {
      const { prisma } = require('../../utils/prisma');
      const mockTemplates = [
        { id: 'template-1', name: 'E-commerce', category: 'Sales' },
        { id: 'template-2', name: 'Brand Awareness', category: 'Marketing' },
      ];

      vi.mocked(prisma.strategyTemplate.findMany).mockResolvedValue(mockTemplates);

      const result = await strategyService.getTemplates();

      expect(result).toEqual(mockTemplates);
    });

    it('should filter by category', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.strategyTemplate.findMany).mockResolvedValue([]);

      await strategyService.getTemplates('E-commerce');

      expect(prisma.strategyTemplate.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          category: 'E-commerce',
        }),
      });
    });
  });

  describe('seedSystemTemplates', () => {
    it('should seed system templates', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.strategyTemplate.create).mockResolvedValue({});

      await strategyService.seedSystemTemplates();

      expect(prisma.strategyTemplate.create).toHaveBeenCalledTimes(3);
    });

    it('should handle seeding errors gracefully', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.strategyTemplate.create).mockRejectedValue(new Error('Seeding error'));

      // Should not throw
      await expect(strategyService.seedSystemTemplates()).resolves.not.toThrow();
    });
  });
});

/**
 * ===========================================
 * Strategy Service
 * ===========================================
 */

import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { aiService } from './ai.service';
import {
  StrategyInput,
  CreateStrategyRequest,
  UpdateStrategyRequest,
  StrategyAnalysisResponse,
} from '../schemas';

/**
 * Strategy Service for managing marketing strategies
 */
class StrategyService {
  /**
   * Analyze strategy with AI
   */
  async analyzeStrategy(strategy: StrategyInput): Promise<StrategyAnalysisResponse> {
    try {
      logger.info('Analyzing strategy', { strategy });

      const analysis = await aiService.analyzeStrategy(strategy);

      logger.info('Strategy analysis complete', {
        insightsCount: analysis.insights.length,
        suggestionsCount: analysis.suggestions.length,
      });

      return analysis;
    } catch (error) {
      logger.error('Strategy analysis failed', { error });
      throw error;
    }
  }

  /**
   * Create new campaign with strategy
   */
  async createCampaign(userId: string, request: CreateStrategyRequest) {
    try {
      logger.info('Creating campaign with strategy', { userId, name: request.name });

      const campaign = await prisma.campaign.create({
        data: {
          userId,
          workflowId: request.workflowId,
          name: request.name,
          description: request.description,
          strategy: request.strategy as any,
          status: 'DRAFT',
        },
      });

      logger.info('Campaign created successfully', { campaignId: campaign.id });

      return campaign;
    } catch (error) {
      logger.error('Campaign creation failed', { error });
      throw new Error(`Failed to create campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update campaign strategy
   */
  async updateCampaign(campaignId: string, userId: string, request: UpdateStrategyRequest) {
    try {
      logger.info('Updating campaign strategy', { campaignId, userId });

      // Verify ownership
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          userId,
        },
      });

      if (!campaign) {
        throw new Error('Campaign not found or access denied');
      }

      const updated = await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          ...(request.name && { name: request.name }),
          ...(request.description && { description: request.description }),
          ...(request.strategy && { strategy: request.strategy as any }),
        },
      });

      logger.info('Campaign updated successfully', { campaignId });

      return updated;
    } catch (error) {
      logger.error('Campaign update failed', { error });
      throw new Error(`Failed to update campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(campaignId: string, userId: string) {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          userId,
        },
        include: {
          workflow: true,
          assets: true,
        },
      });

      if (!campaign) {
        throw new Error('Campaign not found or access denied');
      }

      return campaign;
    } catch (error) {
      logger.error('Failed to get campaign', { error, campaignId });
      throw error;
    }
  }

  /**
   * List campaigns for user
   */
  async listCampaigns(
    userId: string,
    options: {
      status?: string;
      page?: number;
      pageSize?: number;
    } = {}
  ) {
    try {
      const { status, page = 1, pageSize = 20 } = options;

      const where: any = {
        userId,
      };

      if (status) {
        where.status = status;
      }

      const [campaigns, total] = await Promise.all([
        prisma.campaign.findMany({
          where,
          include: {
            workflow: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
            _count: {
              select: {
                assets: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.campaign.count({ where }),
      ]);

      return {
        items: campaigns,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total,
      };
    } catch (error) {
      logger.error('Failed to list campaigns', { error });
      throw error;
    }
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId: string, userId: string) {
    try {
      // Verify ownership
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          userId,
        },
      });

      if (!campaign) {
        throw new Error('Campaign not found or access denied');
      }

      await prisma.campaign.delete({
        where: { id: campaignId },
      });

      logger.info('Campaign deleted successfully', { campaignId });

      return { success: true };
    } catch (error) {
      logger.error('Campaign deletion failed', { error });
      throw new Error(`Failed to delete campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create strategy template
   */
  async createTemplate(
    name: string,
    description: string | undefined,
    category: string,
    template: StrategyInput,
    isSystem: boolean = false
  ) {
    try {
      logger.info('Creating strategy template', { name, category });

      const strategyTemplate = await prisma.strategyTemplate.create({
        data: {
          name,
          description,
          category,
          template: template as any,
          isSystem,
        },
      });

      logger.info('Strategy template created', { templateId: strategyTemplate.id });

      return strategyTemplate;
    } catch (error) {
      logger.error('Template creation failed', { error });
      throw new Error(`Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get strategy templates
   */
  async getTemplates(category?: string) {
    try {
      const where: any = {
        isActive: true,
      };

      if (category) {
        where.category = category;
      }

      const templates = await prisma.strategyTemplate.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
      });

      return templates;
    } catch (error) {
      logger.error('Failed to get templates', { error });
      throw error;
    }
  }

  /**
   * Get strategy template by ID
   */
  async getTemplate(templateId: string) {
    try {
      const template = await prisma.strategyTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        throw new Error('Template not found');
      }

      return template;
    } catch (error) {
      logger.error('Failed to get template', { error, templateId });
      throw error;
    }
  }

  /**
   * Seed system templates
   */
  async seedSystemTemplates() {
    try {
      logger.info('Seeding system strategy templates');

      const templates = [
        {
          name: 'E-commerce Product Launch',
          description: 'Comprehensive strategy for launching new e-commerce products',
          category: 'E-commerce',
          template: {
            targetAudience: {
              ageRange: '25-45',
              interests: ['Shopping', 'Technology', 'Fashion'],
              location: 'National',
            },
            campaignGoals: [
              {
                goal: 'Increase product awareness',
                metric: 'Impressions',
                targetValue: 100000,
              },
              {
                goal: 'Drive sales',
                metric: 'Conversion Rate',
                targetValue: 3,
              },
            ],
            marketingChannels: [
              { name: 'Email Marketing', isActive: true },
              { name: 'Social Media Ads', isActive: true },
              { name: 'Google Shopping', isActive: true },
              { name: 'Influencer Marketing', isActive: true },
            ],
            budgetAllocation: {
              'Email Marketing': 2000,
              'Social Media Ads': 5000,
              'Google Shopping': 4000,
              'Influencer Marketing': 3000,
            } as Record<string, number>,
          },
        },
        {
          name: 'Brand Awareness Campaign',
          description: 'Build brand visibility and recognition',
          category: 'Brand Building',
          template: {
            targetAudience: {
              ageRange: '18-65',
              interests: [],
              location: 'National',
            },
            campaignGoals: [
              {
                goal: 'Increase brand recognition',
                metric: 'Brand Recall',
                targetValue: 40,
              },
              {
                goal: 'Grow social media following',
                metric: 'Followers',
                targetValue: 10000,
              },
            ],
            marketingChannels: [
              { name: 'Social Media Organic', isActive: true },
              { name: 'Social Media Ads', isActive: true },
              { name: 'Content Marketing', isActive: true },
              { name: 'PR & Media', isActive: true },
            ],
            budgetAllocation: {
              'Social Media Organic': 3000,
              'Social Media Ads': 6000,
              'Content Marketing': 4000,
              'PR & Media': 3000,
            } as Record<string, number>,
          },
        },
        {
          name: 'Lead Generation B2B',
          description: 'Generate qualified leads for B2B services',
          category: 'B2B',
          template: {
            targetAudience: {
              ageRange: '25-55',
              interests: ['Business', 'Technology', 'Professional Development'],
              location: 'International',
              occupation: 'Business Professionals',
            },
            campaignGoals: [
              {
                goal: 'Generate qualified leads',
                metric: 'Leads',
                targetValue: 500,
              },
              {
                goal: 'Improve lead quality',
                metric: 'Lead Score',
                targetValue: 75,
              },
            ],
            marketingChannels: [
              { name: 'LinkedIn Ads', isActive: true },
              { name: 'Email Marketing', isActive: true },
              { name: 'Content Marketing', isActive: true },
              { name: 'Webinars', isActive: true },
            ],
            budgetAllocation: {
              'LinkedIn Ads': 5000,
              'Email Marketing': 2000,
              'Content Marketing': 4000,
              'Webinars': 3000,
            } as Record<string, number>,
          },
        },
      ];

      for (const tpl of templates) {
        await this.createTemplate(
          tpl.name,
          tpl.description,
          tpl.category,
          tpl.template as StrategyInput,
          true
        );
      }

      logger.info('System templates seeded successfully');
    } catch (error) {
      logger.error('Failed to seed system templates', { error });
      // Don't throw - this is a seeding operation
    }
  }
}

// Export singleton instance
export const strategyService = new StrategyService();

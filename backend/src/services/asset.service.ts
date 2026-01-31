/**
 * ===========================================
 * Asset Service
 * ===========================================
 */

import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { aiService } from './ai.service';
import type {
  AssetGenerationRequest,
  CreateAssetRequest,
  UpdateAssetRequest,
  BatchAssetGeneration,
  AssetTemplate,
} from '../schemas';

/**
 * Asset Service for managing marketing assets
 */
class AssetService {
  /**
   * Generate asset using AI
   */
  async generateAsset(campaignId: string, request: AssetGenerationRequest) {
    try {
      logger.info('Generating asset', { campaignId, type: request.type });

      if (request.type === 'TEXT') {
        return this.generateTextAsset(campaignId, request);
      } else if (request.type === 'IMAGE') {
        return this.generateImageAsset(campaignId, request);
      }

      throw new Error('Unsupported asset type');
    } catch (error) {
      logger.error('Asset generation failed', { error });
      throw error;
    }
  }

  /**
   * Generate text asset
   */
  private async generateTextAsset(campaignId: string, request: AssetGenerationRequest) {
    const textRequest = request as any; // TextAssetGeneration

    // Build prompt for OpenAI
    const prompt = this.buildTextGenerationPrompt(textRequest);

    const response = await aiService.getClient().chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a professional marketing copywriter. Create engaging, on-brand content.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: textRequest.maxLength || 1000,
    });

    const content = response.choices[0]?.message?.content || '';

    // Save to database
    const asset = await prisma.asset.create({
      data: {
        campaignId,
        type: 'TEXT',
        content,
        metadata: {
          prompt: textRequest.prompt,
          tone: textRequest.tone,
          keywords: textRequest.keywords,
        },
        isAIGenerated: true,
        status: 'GENERATED',
      },
    });

    logger.info('Text asset generated', { assetId: asset.id });

    return asset;
  }

  /**
   * Generate image asset
   */
  private async generateImageAsset(campaignId: string, request: AssetGenerationRequest) {
    const imageRequest = request as any; // ImageAssetGeneration

    // Use DALL-E via OpenAI
    const response = await aiService.getClient().images.generate({
      model: 'dall-e-3',
      prompt: imageRequest.prompt,
      n: imageRequest.numberOfImages || 1,
      size: '1024x1024',
      quality: imageRequest.quality || 'standard',
    });

    const images = response.data.map((img: any) => ({
      url: img.url,
      revisedPrompt: img.revised_prompt,
    }));

    // Create assets for each image
    const assets = await Promise.all(
      images.map((img: any) =>
        prisma.asset.create({
          data: {
            campaignId,
            type: 'IMAGE',
            fileUrl: img.url,
            metadata: {
              prompt: imageRequest.prompt,
              style: imageRequest.style,
              revisedPrompt: img.revised_prompt,
            },
            isAIGenerated: true,
            status: 'GENERATED',
          },
        })
      )
    );

    logger.info('Image assets generated', { count: assets.length });

    return assets[0]; // Return first asset
  }

  /**
   * Batch generate assets
   */
  async batchGenerateAssets(request: BatchAssetGeneration) {
    try {
      logger.info('Batch generating assets', { campaignId: request.campaignId, count: request.assets.length });

      const results = await Promise.all(
        request.assets.map((assetRequest) => this.generateAsset(request.campaignId, assetRequest))
      );

      logger.info('Batch asset generation complete', { count: results.length });

      return results;
    } catch (error) {
      logger.error('Batch asset generation failed', { error });
      throw error;
    }
  }

  /**
   * Create asset manually
   */
  async createAsset(userId: string, request: CreateAssetRequest) {
    try {
      logger.info('Creating asset', { campaignId: request.campaignId, type: request.type });

      // Verify campaign ownership
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.campaignId,
          userId,
        },
      });

      if (!campaign) {
        throw new Error('Campaign not found or access denied');
      }

      const asset = await prisma.asset.create({
        data: {
          campaignId: request.campaignId,
          type: request.type,
          content: request.content,
          fileUrl: request.fileUrl,
          metadata: request.metadata as any,
          isAIGenerated: request.isAIGenerated,
          status: 'DRAFT',
        },
      });

      logger.info('Asset created', { assetId: asset.id });

      return asset;
    } catch (error) {
      logger.error('Asset creation failed', { error });
      throw new Error(`Failed to create asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update asset
   */
  async updateAsset(assetId: string, userId: string, request: UpdateAssetRequest) {
    try {
      // Verify ownership through campaign
      const asset = await prisma.asset.findFirst({
        where: {
          id: assetId,
          campaign: {
            userId,
          },
        },
      });

      if (!asset) {
        throw new Error('Asset not found or access denied');
      }

      const updated = await prisma.asset.update({
        where: { id: assetId },
        data: {
          ...(request.content && { content: request.content }),
          ...(request.fileUrl && { fileUrl: request.fileUrl }),
          ...(request.metadata && { metadata: request.metadata as any }),
          ...(request.status && { status: request.status }),
        },
      });

      logger.info('Asset updated', { assetId });

      return updated;
    } catch (error) {
      logger.error('Asset update failed', { error });
      throw new Error(`Failed to update asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get asset by ID
   */
  async getAsset(assetId: string, userId: string) {
    try {
      const asset = await prisma.asset.findFirst({
        where: {
          id: assetId,
          campaign: {
            userId,
          },
        },
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!asset) {
        throw new Error('Asset not found or access denied');
      }

      return asset;
    } catch (error) {
      logger.error('Failed to get asset', { error, assetId });
      throw error;
    }
  }

  /**
   * List assets for campaign
   */
  async listAssets(
    userId: string,
    campaignId: string,
    options: {
      type?: string;
      status?: string;
      page?: number;
      pageSize?: number;
    } = {}
  ) {
    try {
      const { type, status, page = 1, pageSize = 20 } = options;

      const where: any = {
        campaign: {
          userId,
          id: campaignId,
        },
      };

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
      }

      const [assets, total] = await Promise.all([
        prisma.asset.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.asset.count({ where }),
      ]);

      return {
        items: assets,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total,
      };
    } catch (error) {
      logger.error('Failed to list assets', { error });
      throw error;
    }
  }

  /**
   * Delete asset
   */
  async deleteAsset(assetId: string, userId: string) {
    try {
      // Verify ownership
      const asset = await prisma.asset.findFirst({
        where: {
          id: assetId,
          campaign: {
            userId,
          },
        },
      });

      if (!asset) {
        throw new Error('Asset not found or access denied');
      }

      await prisma.asset.delete({
        where: { id: assetId },
      });

      logger.info('Asset deleted', { assetId });

      return { success: true };
    } catch (error) {
      logger.error('Asset deletion failed', { error });
      throw new Error(`Failed to delete asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create asset template
   */
  async createTemplate(
    name: string,
    description: string | undefined,
    category: string,
    assetType: string,
    template: Record<string, unknown>,
    isSystem: boolean = false
  ) {
    try {
      logger.info('Creating asset template', { name, category });

      const assetTemplate = await prisma.assetTemplate.upsert({
        where: {
          id: `template-${name.toLowerCase().replace(/\s+/g, '-')}`,
        },
        create: {
          id: `template-${name.toLowerCase().replace(/\s+/g, '-')}`,
          name,
          description,
          category,
          template: template as any,
          isSystem,
        },
        update: {
          name,
          description,
          template: template as any,
        },
      });

      logger.info('Asset template created/updated', { templateId: assetTemplate.id });

      return assetTemplate;
    } catch (error) {
      logger.error('Template creation failed', { error });
      throw new Error(`Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get asset templates
   */
  async getTemplates(category?: string, assetType?: string) {
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
   * Build text generation prompt
   */
  private buildTextGenerationPrompt(request: any): string {
    let prompt = `Create marketing copy with the following specifications:\n\n`;
    prompt += `Content Request: ${request.prompt}\n`;

    if (request.tone) {
      prompt += `Tone: ${request.tone}\n`;
    }

    if (request.targetAudience) {
      prompt += `Target Audience: ${request.targetAudience}\n`;
    }

    if (request.keywords && request.keywords.length > 0) {
      prompt += `Keywords: ${request.keywords.join(', ')}\n`;
    }

    prompt += `\nGenerate engaging, professional marketing content.`;

    return prompt;
  }
}

// Export singleton instance
export const assetService = new AssetService();

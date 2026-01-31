/**
 * ===========================================
 * Asset Service Tests
 * ===========================================
 */

import { describe, it, expect, beforeEach, vi } from '@jest/globals';
import { assetService } from '../../services/asset.service';
import { aiService } from '../../services/ai.service';

// Mock dependencies
vi.mock('../../utils/prisma', () => ({
  prisma: {
    asset: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    strategyTemplate: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../../services/ai.service');

describe('AssetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAsset', () => {
    it('should generate text asset', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(aiService.getClient).mockReturnValue({
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: 'Generated marketing copy for summer sale...',
                  },
                },
              ],
            },
          },
        },
      });

      vi.mocked(prisma.asset.create).mockResolvedValue({
        id: 'asset-123',
        type: 'TEXT',
        content: 'Generated marketing copy',
        isAIGenerated: true,
        status: 'GENERATED',
      });

      const request = {
        type: 'TEXT' as const,
        prompt: 'Create promotional content for summer sale',
        tone: 'excited',
        maxLength: 500,
      };

      const result = await assetService.generateAsset('campaign-123', 'user-123', request);

      expect(result).toHaveProperty('id');
      expect(result.type).toBe('TEXT');
      expect(prisma.asset.create).toHaveBeenCalled();
    });

    it('should generate image asset with DALL-E', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(aiService.getClient().images.generate).mockResolvedValue({
        data: [
          {
            url: 'https://openai.com/generated-image-1.png',
            revised_prompt: 'Improved prompt',
          },
        ],
      });

      vi.mocked(prisma.asset.create).mockResolvedValue({
        id: 'asset-123',
        type: 'IMAGE',
        fileUrl: 'https://openai.com/generated-image-1.png',
        isAIGenerated: true,
        status: 'GENERATED',
      });

      const request = {
        type: 'IMAGE' as const,
        prompt: 'Create a product image',
        style: 'modern',
        dimensions: { width: 1024, height: 1024 },
        numberOfImages: 1,
        quality: 'standard',
      };

      const result = await assetService.generateAsset('campaign-123', 'user-123', request);

      expect(result).toHaveProperty('id');
      expect(result.type).toBe('IMAGE');
      expect(result.fileUrl).toContain('https://');
    });
  });

  describe('batchGenerateAssets', () => {
    it('should generate multiple assets', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(assetService.generateAsset as any).mockResolvedValue({
        id: 'asset-123',
        type: 'TEXT',
        content: 'Generated content',
      });

      const request = {
        campaignId: 'campaign-123',
        assets: [
          {
            type: 'TEXT' as const,
            prompt: 'Generate email copy',
          },
          {
            type: 'IMAGE' as const,
            prompt: 'Generate product image',
          },
        ],
      };

      const results = await assetService.batchGenerateAssets(request);

      expect(results).toHaveLength(2);
      expect(assetService.generateAsset).toHaveBeenCalledTimes(2);
    });
  });

  describe('createAsset', () => {
    it('should create asset manually', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.campaign.findFirst).mockResolvedValue({
        id: 'campaign-123',
        userId: 'user-123',
      });

      vi.mocked(prisma.asset.create).mockResolvedValue({
        id: 'asset-123',
        type: 'TEXT',
        content: 'Custom content',
        isAIGenerated: false,
        status: 'DRAFT',
      });

      const request = {
        campaignId: 'campaign-123',
        type: 'TEXT' as const,
        content: 'Custom content',
      };

      const result = await assetService.createAsset('user-123', request);

      expect(result).toHaveProperty('id');
      expect(prisma.campaign.findFirst).toHaveBeenCalled();
      expect(prisma.asset.create).toHaveBeenCalled();
    });
  });

  describe('listAssets', () => {
    it('should list assets for campaign', async () => {
      const { prisma } = require('../../utils/prisma');

      const mockAssets = [
        {
          id: 'asset-1',
          type: 'TEXT',
          content: 'Content 1',
        },
        {
          id: 'asset-2',
          type: 'IMAGE',
          fileUrl: 'https://example.com/image.png',
        },
      ];

      vi.mocked(prisma.asset.findMany).mockResolvedValue(mockAssets);
      vi.mocked(prisma.asset.count).mockResolvedValue(2);

      const result = await assetService.listAssets('user-123', 'campaign-123', {
        type: 'TEXT',
      });

      expect(result).toHaveProperty('items');
      expect(result.items).toHaveLength(2);
    });
  });

  describe('updateAsset', () => {
    it('should update asset status', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.asset.findFirst).mockResolvedValue({
        id: 'asset-123',
        campaignId: 'campaign-123',
        status: 'DRAFT',
      });

      vi.mocked(prisma.asset.update).mockResolvedValue({
        id: 'asset-123',
        status: 'APPROVED',
      });

      const result = await assetService.updateAsset('asset-123', 'user-123', {
        status: 'APPROVED',
      });

      expect(result.status).toBe('APPROVED');
      expect(prisma.asset.update).toHaveBeenCalled();
    });
  });

  describe('deleteAsset', () => {
    it('should delete asset', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.asset.findFirst).mockResolvedValue({
        id: 'asset-123',
        campaign: {
          userId: 'user-123',
        },
      });

      vi.mocked(prisma.asset.delete).mockResolvedValue({});

      const result = await assetService.deleteAsset('asset-123', 'user-123');

      expect(result).toEqual({ success: true });
      expect(prisma.asset.delete).toHaveBeenCalledWith({
        where: { id: 'asset-123' },
      });
    });
  });
});

/**
 * ===========================================
 * Assistant Service Tests
 * ===========================================
 */

import { describe, it, expect, beforeEach, vi } from '@jest/globals';
import { assistantService } from '../../services/assistant.service';
import { aiService } from '../../services/ai.service';
import { workflowService } from '../../services/workflow.service';
import { assetService } from '../../services/asset.service';
import { analyticsService } from '../../services/analytics.service';

// Mock dependencies
vi.mock('../../utils/prisma', () => ({
  prisma: {
    conversation: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    campaign: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('../../services/ai.service');
vi.mock('../../services/workflow.service');
vi.mock('../../services/asset.service');
vi.mock('../../services/analytics.service');

describe('AssistantService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send message and get AI response', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.conversation.upsert).mockResolvedValue({
        id: 'conv-123',
        userId: 'user-123',
        messages: [],
        isActive: true,
      });

      vi.mocked(aiService.getClient().chat.completions.create).mockResolvedValue({
        choices: [
          {
            message: {
              content: 'I can help you create a workflow for that purpose',
            },
          },
        ],
      });

      vi.mocked(prisma.conversation.update).mockResolvedValue({
        id: 'conv-123',
        messages: [
          { role: 'user', content: 'Create a workflow', timestamp: new Date().toISOString() },
          {
            role: 'assistant',
            content: 'I can help you create a workflow for that purpose',
            timestamp: new Date().toISOString(),
            metadata: { model: 'gpt-4' },
          },
        ],
      });

      const request = {
        message: 'Create a workflow for email automation',
      };

      const result = await assistantService.sendMessage('user-123', request);

      expect(result).toHaveProperty('conversation');
      expect(result.conversation.messages).toHaveLength(2);
      expect(result.response.content).toContain('workflow');
    });

    it('should create new conversation if not provided', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.conversation.create).mockResolvedValue({
        id: 'conv-123',
        userId: 'user-123',
        messages: [],
        isActive: true,
      });

      vi.mocked(aiService.getClient().chat.completions.create).mockResolvedValue({
        choices: [{ message: { content: 'AI response' } }],
      });

      vi.mocked(prisma.conversation.update).mockResolvedValue({
        id: 'conv-123',
        messages: [
          { role: 'user', content: 'Test message' },
          { role: 'assistant', content: 'AI response' },
        ],
      });

      const result = await assistantService.sendMessage('user-123', {
        message: 'Test message',
      });

      expect(result.conversation.id).toBe('conv-123');
      expect(prisma.conversation.create).toHaveBeenCalled();
    });
  });

  describe('executeChatAction', () => {
    it('should execute generate workflow action', async () => {
      const { prisma } = require('../../utils/prisma');

      const conversations = [
        {
          id: 'conv-123',
          userId: 'user-123',
          messages: [{ role: 'user', content: 'Generate a workflow' }],
        },
      ];

      vi.mocked(prisma.conversation.findMany).mockResolvedValue(conversations);

      vi.mocked(workflowService.generateWorkflow).mockResolvedValue({
        id: 'workflow-123',
        name: 'Generated Workflow',
      });

      const action = {
        type: 'generate_workflow' as const,
        workflowName: 'My Workflow',
      };

      const result = await assistantService.executeChatAction('user-123', action);

      expect(result).toHaveProperty('action', 'workflow_generated');
      expect(result).toHaveProperty('workflowId', 'workflow-123');
    });
  });

  describe('listConversations', () => {
    it('should list user conversations', async () => {
      const { prisma } = require('../../utils/prisma');

      const mockConversations = [
        {
          id: 'conv-1',
          userId: 'user-123',
          title: 'Workflow Help',
          messages: [],
          isActive: true,
        },
        {
          id: 'conv-2',
          userId: 'user-123',
          title: 'Strategy Discussion',
          messages: [],
          isActive: true,
        },
      ];

      vi.mocked(prisma.conversation.findMany).mockResolvedValue(mockConversations);
      vi.mocked(prisma.conversation.count).mockResolvedValue(2);

      const result = await assistantService.listConversations('user-123', { page: 1, pageSize: 20 });

      expect(result).toHaveProperty('items');
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should paginate conversations', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.conversation.findMany).mockResolvedValue([]);
      vi.mocked(prisma.conversation.count).mockResolvedValue(0);

      const result = await assistantService.listConversations('user-123', {
        page: 2,
        pageSize: 10,
      });

      expect(prisma.conversation.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', isActive: true },
        orderBy: { updatedAt: 'desc' },
        skip: 10,
        take: 10,
      });
    });
  });

  describe('deleteConversation', () => {
    it('should soft delete conversation', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.conversation.findFirst).mockResolvedValue({
        id: 'conv-123',
        userId: 'user-123',
      });

      vi.mocked(prisma.conversation.update).mockResolvedValue({
        id: 'conv-123',
        isActive: false,
      });

      const result = await assistantService.deleteConversation('conv-123', 'user-123');

      expect(result).toEqual({ success: true });
      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: 'conv-123' },
        data: { isActive: false },
      });
    });
  });

  describe('getConversation', () => {
    it('should get conversation by ID', async () => {
      const { prisma } = require('../../utils/prisma');

      const mockConversation = {
        id: 'conv-123',
        userId: 'user-123',
        title: 'Workflow Help',
        messages: [
          { role: 'user', content: 'Help me create a workflow' },
          { role: 'assistant', content: 'I can help with that' },
        ],
        context: {},
      };

      vi.mocked(prisma.conversation.findFirst).mockResolvedValue(mockConversation);

      const result = await assistantService.getConversation('conv-123', 'user-123');

      expect(result).toEqual(mockConversation);
    });

    it('should throw error if conversation not found', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.conversation.findFirst).mockResolvedValue(null);

      await expect(
        assistantService.getConversation('conv-123', 'user-123')
      ).rejects.toThrow('Conversation not found or access denied');
    });
  });
});

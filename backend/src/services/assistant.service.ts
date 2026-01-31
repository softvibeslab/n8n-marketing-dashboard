/**
 * ===========================================
 * AI Assistant Service
 * ===========================================
 */

import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { aiService } from './ai.service';
import { workflowService } from './workflow.service';
import { assetService } from './asset.service';
import { analyticsService } from './analytics.service';
import type {
  ChatMessage,
  SendMessage,
  GenerateWorkflowFromChat,
  ChatAction,
} from '../schemas';

/**
 * AI Assistant Service for conversational AI guidance
 */
class AssistantService {
  /**
   * Send message and get AI response
   */
  async sendMessage(userId: string, request: SendMessage) {
    try {
      logger.info('Processing assistant message', { userId, hasConversationId: !!request.conversationId });

      // Get or create conversation
      let conversation;
      let messages: ChatMessage[] = [];

      if (request.conversationId) {
        conversation = await prisma.conversation.findFirst({
          where: {
            id: request.conversationId,
            userId,
            isActive: true,
          },
        });

        if (!conversation) {
          throw new Error('Conversation not found');
        }

        messages = conversation.messages as ChatMessage[];
      } else {
        // Create new conversation
        conversation = await prisma.conversation.create({
          data: {
            userId,
            messages: [],
            context: request.context as any || {},
            isActive: true,
          },
        });
      }

      // Add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: request.message,
        timestamp: new Date().toISOString(),
      };

      messages.push(userMessage);

      // Get AI response
      const aiResponse = await this.getAIResponse(messages, conversation.context as any);

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date().toISOString(),
        metadata: aiResponse.metadata,
      };

      messages.push(assistantMessage);

      // Update conversation
      const updated = await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          messages: messages as any,
          context: aiResponse.context as any,
          updatedAt: new Date(),
        },
      });

      // Note: Conversation title generation disabled - title property not in schema

      logger.info('Assistant message processed', { conversationId: conversation.id });

      return {
        conversation: updated,
        response: assistantMessage,
        suggestedActions: aiResponse.suggestedActions,
      };
    } catch (error) {
      logger.error('Failed to process assistant message', { error });
      throw error;
    }
  }

  /**
   * Execute chat action
   */
  async executeChatAction(userId: string, action: ChatAction) {
    try {
      logger.info('Executing chat action', { userId, type: action.type });

      switch (action.type) {
        case 'generate_workflow':
          return this.handleGenerateWorkflowAction(userId, action);

        case 'create_asset':
          return this.handleCreateAssetAction(userId, action);

        case 'execute_workflow':
          return this.handleExecuteWorkflowAction(userId, action);

        case 'get_analytics':
          return this.handleGetAnalyticsAction(userId, action);

        default:
          throw new Error('Unknown action type');
      }
    } catch (error) {
      logger.error('Failed to execute chat action', { error });
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  async getConversation(conversationId: string, userId: string) {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
      });

      if (!conversation) {
        throw new Error('Conversation not found or access denied');
      }

      return conversation;
    } catch (error) {
      logger.error('Failed to get conversation', { error, conversationId });
      throw error;
    }
  }

  /**
   * List user conversations
   */
  async listConversations(userId: string, options: { page?: number; pageSize?: number } = {}) {
    try {
      const { page = 1, pageSize = 20 } = options;

      const [conversations, total] = await Promise.all([
        prisma.conversation.findMany({
          where: {
            userId,
            isActive: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.conversation.count({
          where: {
            userId,
            isActive: true,
          },
        }),
      ]);

      return {
        items: conversations,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total,
      };
    } catch (error) {
      logger.error('Failed to list conversations', { error });
      throw error;
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string, userId: string) {
    try {
      // Verify ownership
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
      });

      if (!conversation) {
        throw new Error('Conversation not found or access denied');
      }

      // Soft delete by setting isActive to false
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          isActive: false,
        },
      });

      logger.info('Conversation deleted', { conversationId });

      return { success: true };
    } catch (error) {
      logger.error('Failed to delete conversation', { error });
      throw error;
    }
  }

  /**
   * Get AI response
   */
  private async getAIResponse(messages: ChatMessage[], context: any = {}) {
    try {
      // Build system message
      const systemMessage = this.buildSystemMessage(context);

      // Build messages array for OpenAI
      const apiMessages = [
        {
          role: 'system' as const,
          content: systemMessage,
        },
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      const response = await aiService.getClient().chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content || '';

      // Extract suggested actions from response
      const suggestedActions = this.extractSuggestedActions(content);

      // Update context with new information
      const updatedContext = {
        ...context,
        lastInteraction: new Date().toISOString(),
      };

      return {
        content,
        metadata: {
          model: 'gpt-4-turbo-preview',
          usage: response.usage,
        },
        suggestedActions,
        context: updatedContext,
      };
    } catch (error) {
      logger.error('Failed to get AI response', { error });
      throw new Error(`AI response failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build system message
   */
  private buildSystemMessage(context: any): string {
    let message = `You are an AI assistant for the n8n Marketing Dashboard. Your role is to help users:
1. Create and optimize marketing campaigns
2. Generate n8n automation workflows
3. Create marketing assets (text, images)
4. Analyze campaign performance
5. Provide marketing insights and recommendations

Always be helpful, concise, and actionable. When users request actions that can be performed in the dashboard, offer to help execute them.

Available actions:
- Generate workflows from natural language descriptions
- Create marketing assets with AI
- Analyze campaign performance and provide insights
- Execute workflows
- Provide marketing strategy advice

`;
    if (context.activeCampaign) {
      message += `\nCurrent Campaign: ${context.activeCampaign}\n`;
    }

    if (context.recentWorkflows) {
      message += `\nRecent Workflows: ${context.recentWorkflows}\n`;
    }

    return message;
  }

  /**
   * Extract suggested actions from AI response
   */
  private extractSuggestedActions(content: string): any[] {
    const actions: any[] = [];

    // Look for action patterns in the response
    if (content.toLowerCase().includes('workflow') || content.toLowerCase().includes('automation')) {
      actions.push({
        type: 'generate_workflow',
        label: 'Generate Workflow',
        description: 'Create a workflow based on this conversation',
        icon: '⚡',
      });
    }

    if (content.toLowerCase().includes('asset') || content.toLowerCase().includes('content')) {
      actions.push({
        type: 'create_asset',
        label: 'Create Asset',
        description: 'Generate marketing content',
        icon: '🎨',
      });
    }

    if (content.toLowerCase().includes('analytics') || content.toLowerCase().includes('performance')) {
      actions.push({
        type: 'get_analytics',
        label: 'View Analytics',
        description: 'Check campaign performance',
        icon: '📊',
      });
    }

    return actions;
  }

  /**
   * Generate conversation title
   */
  private generateConversationTitle(firstMessage: string): string {
    // Extract key topic from first message
    const words = firstMessage.split(' ').slice(0, 5);
    return words.join(' ').substring(0, 50) + '...';
  }

  /**
   * Handle generate workflow action
   */
  private async handleGenerateWorkflowAction(userId: string, action: any) {
    // Get the most recent conversation
    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 1,
    });

    if (!conversations || conversations.length === 0) {
      throw new Error('No active conversation found');
    }

    const conversation = conversations[0];
    const messages = conversation.messages as ChatMessage[];

    // Build natural language input from conversation
    const conversationSummary = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    // Generate workflow
    const workflow = await workflowService.generateWorkflow(userId, {
      name: action.workflowName,
      naturalLanguageInput: conversationSummary,
    });

    return {
      action: 'workflow_generated',
      workflowId: workflow.id,
      workflowName: workflow.name,
    };
  }

  /**
   * Handle create asset action
   */
  private async handleCreateAssetAction(userId: string, action: any) {
    // For now, return a placeholder
    // In production, this would use the conversation context to generate relevant assets
    return {
      action: 'asset_creation_ready',
      assetType: action.assetType,
      prompt: action.prompt,
    };
  }

  /**
   * Handle execute workflow action
   */
  private async handleExecuteWorkflowAction(userId: string, action: any) {
    const execution = await workflowService.executeWorkflow(action.workflowId, userId, {});

    return {
      action: 'workflow_executed',
      executionId: execution.id,
      status: execution.status,
    };
  }

  /**
   * Handle get analytics action
   */
  private async handleGetAnalyticsAction(userId: string, action: any) {
    const metrics = await analyticsService.getCampaignMetrics(
      action.campaignId,
      { period: '30d' },
      userId
    );

    return {
      action: 'analytics_retrieved',
      campaignId: action.campaignId,
      metrics,
    };
  }
}

// Export singleton instance
export const assistantService = new AssistantService();

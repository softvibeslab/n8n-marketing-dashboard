/**
 * ===========================================
 * AI Service Tests
 * ===========================================
 */

import { describe, it, expect, beforeEach, vi } from '@jest/globals';
import { aiService } from '../../services/ai.service';
import type { StrategyInput, WorkflowGenerationRequest } from '../../schemas';

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    })),
  };
});

describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeStrategy', () => {
    it('should analyze strategy and return insights', async () => {
      const strategy: StrategyInput = {
        targetAudience: {
          ageRange: '25-45',
          interests: ['Technology', 'Fashion'],
          location: 'United States',
        },
        campaignGoals: [
          {
            goal: 'Increase brand awareness',
            metric: 'Impressions',
            targetValue: 100000,
          },
        ],
        marketingChannels: [
          {
            name: 'Social Media Ads',
            isActive: true,
          },
        ],
        budgetAllocation: {
          'Social Media Ads': 5000,
        },
      };

      // Mock AI response
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                insights: ['Target audience is well-defined', 'Budget allocation is reasonable'],
                suggestions: [
                  {
                    category: 'Channels',
                    suggestion: 'Consider adding email marketing',
                    priority: 'medium' as const,
                  },
                ],
                recommendedChannels: ['Social Media', 'Email Marketing'],
                budgetOptimization: {
                  recommendations: ['Allocate 20% more to retargeting'],
                  totalEstimatedBudget: 6000,
                },
                riskAssessment: {
                  risks: ['High competition on social media'],
                  mitigations: ['Focus on niche audiences'],
                },
              }),
            },
          },
        ],
      };

      const OpenAI = require('openai');
      const client = new OpenAI.default();
      (client.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await aiService.analyzeStrategy(strategy);

      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('recommendedChannels');
      expect(result.insights).toBeInstanceOf(Array);
      expect(result.insights.length).toBeGreaterThan(0);
    });

    it('should handle API errors gracefully', async () => {
      const strategy: StrategyInput = {
        targetAudience: {},
        campaignGoals: [{ goal: 'Test', metric: 'Test', targetValue: 100 }],
        marketingChannels: [],
      };

      const OpenAI = require('openai');
      const client = new OpenAI.default();
      (client.chat.completions.create as jest.Mock).mockRejectedValue(new Error('API Error'));

      await expect(aiService.analyzeStrategy(strategy)).rejects.toThrow('AI analysis failed');
    });
  });

  describe('generateWorkflow', () => {
    it('should generate workflow from natural language', async () => {
      const request: WorkflowGenerationRequest = {
        name: 'Test Workflow',
        description: 'A test workflow',
        naturalLanguageInput: 'Create a workflow that sends an email when a user signs up',
      };

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: 'Test Workflow',
                nodes: [
                  {
                    id: 'node-1',
                    name: 'Webhook',
                    type: 'n8n-nodes-base.webhook',
                    parameters: {},
                    position: [250, 300],
                  },
                  {
                    id: 'node-2',
                    name: 'Send Email',
                    type: 'n8n-nodes-base.emailSend',
                    parameters: {},
                    position: [450, 300],
                  },
                ],
                connections: {
                  'node-1': [
                    [
                      {
                        node: 'node-2',
                        type: 'main',
                        index: 0,
                      },
                    ],
                  ],
                },
              }),
            },
          },
        ],
      };

      const OpenAI = require('openai');
      const client = new OpenAI.default();
      (client.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await aiService.generateWorkflow(request);

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('nodes');
      expect(result).toHaveProperty('connections');
      expect(result.nodes).toBeInstanceOf(Array);
      expect(result.nodes.length).toBeGreaterThan(0);
    });

    it('should validate and fix workflow structure', async () => {
      const request: WorkflowGenerationRequest = {
        name: 'Test Workflow',
        naturalLanguageInput: 'Simple workflow',
      };

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                nodes: [
                  {
                    name: 'Node 1',
                    type: 'n8n-nodes-base.noOp',
                  },
                ],
                connections: {},
              }),
            },
          },
        ],
      };

      const OpenAI = require('openai');
      const client = new OpenAI.default();
      (client.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await aiService.generateWorkflow(request);

      // Should add missing fields
      expect(result.nodes[0]).toHaveProperty('id');
      expect(result.nodes[0]).toHaveProperty('position');
    });
  });

  describe('optimizeWorkflow', () => {
    it('should optimize existing workflow', async () => {
      const workflow = {
        name: 'Original Workflow',
        nodes: [
          {
            id: 'node-1',
            name: 'Node 1',
            type: 'n8n-nodes-base.noOp',
            parameters: {},
            position: [250, 300],
          },
        ],
        connections: {},
      };

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: 'Optimized Workflow',
                nodes: workflow.nodes,
                connections: workflow.connections,
              }),
            },
          },
        ],
      };

      const OpenAI = require('openai');
      const client = new OpenAI.default();
      (client.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await aiService.optimizeWorkflow(workflow, 'improve performance');

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('nodes');
    });
  });

  describe('generateWorkflowDescription', () => {
    it('should generate description for workflow', async () => {
      const workflow = {
        name: 'Email Workflow',
        nodes: [
          {
            id: 'node-1',
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            parameters: {},
            position: [250, 300],
          },
        ],
        connections: {},
      };

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This workflow triggers on a webhook and processes incoming data.',
            },
          },
        ],
      };

      const OpenAI = require('openai');
      const client = new OpenAI.default();
      (client.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await aiService.generateWorkflowDescription(workflow);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

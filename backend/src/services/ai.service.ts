/**
 * ===========================================
 * AI Service - Workflow Generation & Strategy Analysis
 * ===========================================
 */

import OpenAI from 'openai';
import { config } from '../config';
import { logger } from '../utils/logger';
import {
  StrategyInput,
  StrategyAnalysisResponse,
  N8nWorkflow,
  WorkflowGenerationRequest,
} from '../schemas';

/**
 * AI Service for workflow generation and strategy analysis
 */
class AIService {
  private openai: OpenAI | null = null;
  private groq: OpenAI | null = null;

  constructor() {
    // Initialize OpenAI client
    if (config.ai.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: config.ai.openaiApiKey,
      });
    }

    // Initialize Groq client (alternative)
    if (config.ai.groqApiKey) {
      this.groq = new OpenAI({
        apiKey: config.ai.groqApiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }

    if (!this.openai && !this.groq) {
      logger.warn('No AI provider configured. Set OPENAI_API_KEY or GROQ_API_KEY');
    }
  }

  /**
   * Get AI client (OpenAI or Groq)
   */
  protected getClient(): OpenAI {
    return this.openai || this.groq || new OpenAI();
  }

  /**
   * Analyze strategy with AI-powered insights
   */
  async analyzeStrategy(strategy: StrategyInput): Promise<StrategyAnalysisResponse> {
    try {
      const client = this.getClient();

      const prompt = this.buildStrategyAnalysisPrompt(strategy);

      const response = await client.chat.completions.create({
        model: config.ai.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert marketing strategist with deep knowledge of digital marketing, customer behavior, and campaign optimization.
Provide actionable insights and recommendations based on the strategy input.
Respond in JSON format with insights, suggestions, recommendedChannels, budgetOptimization, and riskAssessment.`,
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

      const analysis = JSON.parse(content);

      return {
        insights: analysis.insights || [],
        suggestions: analysis.suggestions || [],
        recommendedChannels: analysis.recommendedChannels || [],
        budgetOptimization: analysis.budgetOptimization,
        riskAssessment: analysis.riskAssessment,
      };
    } catch (error) {
      logger.error('Strategy analysis failed', { error });
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate n8n workflow from natural language
   */
  async generateWorkflow(request: WorkflowGenerationRequest): Promise<N8nWorkflow> {
    try {
      const client = this.getClient();

      const prompt = this.buildWorkflowGenerationPrompt(request);

      const response = await client.chat.completions.create({
        model: config.ai.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert n8n workflow architect.
Generate valid n8n workflow JSON based on the user's requirements.
The workflow must follow n8n schema with nodes and connections.
Each node must have: id, name, type, parameters, position (x, y).
Common node types: '@n8n/n8n-nodes-langchain.lmChatOpenAiChatModel', 'n8n-nodes-base.openAi', 'n8n-nodes-base.httpRequest', 'n8n-nodes-base.code', 'n8n-nodes-base.if', 'n8n-nodes-base.switch', 'n8n-nodes-base.merge', 'n8n-nodes-base.set', 'n8n-nodes-base.webhook'.
Respond in valid JSON format following n8n workflow schema.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty AI response');
      }

      const workflow = JSON.parse(content);

      // Validate workflow structure
      return this.validateAndFixWorkflow(workflow, request.name);
    } catch (error) {
      logger.error('Workflow generation failed', { error });
      throw new Error(`Workflow generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Optimize existing workflow with AI suggestions
   */
  async optimizeWorkflow(workflow: N8nWorkflow, goal: string): Promise<N8nWorkflow> {
    try {
      const client = this.getClient();

      const prompt = `Analyze and optimize this n8n workflow for: ${goal}

Current workflow:
${JSON.stringify(workflow, null, 2)}

Provide optimized workflow JSON with improved:
- Node efficiency
- Error handling
- Performance
- Best practices

Respond in valid JSON format following n8n workflow schema.`;

      const response = await client.chat.completions.create({
        model: config.ai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an n8n workflow optimization expert. Provide optimized workflow JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty AI response');
      }

      const optimized = JSON.parse(content);
      return this.validateAndFixWorkflow(optimized, workflow.name);
    } catch (error) {
      logger.error('Workflow optimization failed', { error });
      throw new Error(`Workflow optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate workflow description
   */
  async generateWorkflowDescription(workflow: N8nWorkflow): Promise<string> {
    try {
      const client = this.getClient();

      const prompt = `Generate a clear, concise description for this n8n workflow:

${JSON.stringify(workflow, null, 2)}

The description should explain:
1. What the workflow does
2. Key triggers and actions
3. Expected outcome

Provide a 2-3 sentence description.`;

      const response = await client.chat.completions.create({
        model: config.ai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a technical writer specializing in workflow automation.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 200,
      });

      return response.choices[0]?.message?.content || 'No description available';
    } catch (error) {
      logger.error('Description generation failed', { error });
      return 'Workflow description unavailable';
    }
  }

  /**
   * Build prompt for strategy analysis
   */
  private buildStrategyAnalysisPrompt(strategy: StrategyInput): string {
    return `Analyze this marketing strategy and provide insights:

Target Audience:
${JSON.stringify(strategy.targetAudience, null, 2)}

Campaign Goals:
${JSON.stringify(strategy.campaignGoals, null, 2)}

Marketing Channels:
${JSON.stringify(strategy.marketingChannels, null, 2)}

${strategy.budgetAllocation ? `Budget Allocation:\n${JSON.stringify(strategy.budgetAllocation, null, 2)}\n` : ''}
${strategy.timeline ? `Timeline:\n${JSON.stringify(strategy.timeline, null, 2)}\n` : ''}
${strategy.brandGuidelines ? `Brand Guidelines:\n${JSON.stringify(strategy.brandGuidelines, null, 2)}\n` : ''}
${strategy.additionalNotes ? `Additional Notes:\n${strategy.additionalNotes}` : ''}

Provide:
1. Key insights about the strategy
2. Suggestions for improvement (with priority: low/medium/high)
3. Recommended marketing channels
4. Budget optimization recommendations
5. Risk assessment with mitigations

Respond as JSON.`;
  }

  /**
   * Build prompt for workflow generation
   */
  private buildWorkflowGenerationPrompt(request: WorkflowGenerationRequest): string {
    let prompt = `Generate an n8n workflow with the following requirements:\n\n`;
    prompt += `Description: ${request.naturalLanguageInput}\n`;
    prompt += `Workflow Name: ${request.name}\n`;

    if (request.description) {
      prompt += `Additional Details: ${request.description}\n`;
    }

    prompt += `\nRequirements:\n`;
    prompt += `- Follow n8n workflow schema exactly\n`;
    prompt += `- Include proper error handling\n`;
    prompt += `- Add appropriate trigger nodes\n`;
    prompt += `- Use best practices for node connections\n`;
    prompt += `- Position nodes visually (x, y coordinates)\n`;
    prompt += `- Include meaningful node names\n`;

    return prompt;
  }

  /**
   * Validate and fix workflow structure
   */
  private validateAndFixWorkflow(workflow: any, name: string): N8nWorkflow {
    // Ensure required fields exist
    if (!workflow.name) {
      workflow.name = name;
    }

    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      throw new Error('Workflow must have nodes array');
    }

    if (!workflow.connections || typeof workflow.connections !== 'object') {
      workflow.connections = {};
    }

    // Validate each node
    workflow.nodes = workflow.nodes.map((node: any, index: number) => ({
      id: node.id || `node-${Date.now()}-${index}`,
      name: node.name || `Node ${index + 1}`,
      type: node.type || 'n8n-nodes-base.noOp',
      parameters: node.parameters || {},
      position: node.position || [index * 200, 0],
      typeVersion: node.typeVersion || 1,
      notes: node.notes,
    }));

    // Ensure proper connection structure
    Object.keys(workflow.connections).forEach((nodeId) => {
      const connections = workflow.connections[nodeId];
      if (!Array.isArray(connections)) {
        workflow.connections[nodeId] = [];
      }
    });

    return workflow as N8nWorkflow;
  }
}

// Export singleton instance
export const aiService = new AIService();

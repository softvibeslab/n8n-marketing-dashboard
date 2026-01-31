/**
 * ===========================================
 * n8n Integration Service
 * ===========================================
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import { N8nWorkflow, WorkflowValidationResponse } from '../schemas';

/**
 * n8n Service for workflow integration
 */
class N8nService {
  private client: AxiosInstance;
  private webhookUrl: string;

  constructor() {
    // Create axios instance with n8n API configuration
    this.client = axios.create({
      baseURL: config.n8n.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': config.n8n.apiKey,
      },
      timeout: 30000, // 30 seconds
    });

    this.webhookUrl = config.n8n.webhookUrl;

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('n8n API error', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Test n8n connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/active-workflows');
      return response.status === 200;
    } catch (error) {
      logger.error('n8n connection test failed', { error });
      return false;
    }
  }

  /**
   * Deploy workflow to n8n
   */
  async deployWorkflow(workflow: N8nWorkflow): Promise<{ id: string; url: string }> {
    try {
      logger.info('Deploying workflow to n8n', { name: workflow.name });

      // Create new workflow
      const response = await this.client.post('/workflows', {
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections,
        settings: workflow.settings || {},
        staticData: workflow.staticData || null,
        tags: workflow.tags || [],
      });

      const workflowId = response.data.id;
      const workflowUrl = `${config.n8n.apiUrl.replace('/api/v1', '')}/workflow/${workflowId}`;

      logger.info('Workflow deployed successfully', { workflowId, workflowUrl });

      return {
        id: workflowId,
        url: workflowUrl,
      };
    } catch (error) {
      logger.error('Workflow deployment failed', { error });
      throw new Error(`Failed to deploy workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update existing workflow in n8n
   */
  async updateWorkflow(workflowId: string, workflow: N8nWorkflow): Promise<void> {
    try {
      logger.info('Updating workflow in n8n', { workflowId, name: workflow.name });

      await this.client.patch(`/workflows/${workflowId}`, {
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections,
        settings: workflow.settings || {},
        staticData: workflow.staticData || null,
        tags: workflow.tags || [],
      });

      logger.info('Workflow updated successfully', { workflowId });
    } catch (error) {
      logger.error('Workflow update failed', { error, workflowId });
      throw new Error(`Failed to update workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get workflow from n8n
   */
  async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
    try {
      const response = await this.client.get(`/workflows/${workflowId}`);
      return response.data as N8nWorkflow;
    } catch (error) {
      logger.error('Failed to get workflow', { error, workflowId });
      throw new Error(`Failed to get workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete workflow from n8n
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      logger.info('Deleting workflow from n8n', { workflowId });
      await this.client.delete(`/workflows/${workflowId}`);
      logger.info('Workflow deleted successfully', { workflowId });
    } catch (error) {
      logger.error('Workflow deletion failed', { error, workflowId });
      throw new Error(`Failed to delete workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Activate workflow in n8n
   */
  async activateWorkflow(workflowId: string): Promise<void> {
    try {
      logger.info('Activating workflow in n8n', { workflowId });
      await this.client.post(`/workflows/${workflowId}/activate`);
      logger.info('Workflow activated successfully', { workflowId });
    } catch (error) {
      logger.error('Workflow activation failed', { error, workflowId });
      throw new Error(`Failed to activate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deactivate workflow in n8n
   */
  async deactivateWorkflow(workflowId: string): Promise<void> {
    try {
      logger.info('Deactivating workflow in n8n', { workflowId });
      await this.client.post(`/workflows/${workflowId}/deactivate`);
      logger.info('Workflow deactivated successfully', { workflowId });
    } catch (error) {
      logger.error('Workflow deactivation failed', { error, workflowId });
      throw new Error(`Failed to deactivate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute workflow manually
   */
  async executeWorkflow(workflowId: string, inputData?: Record<string, unknown>): Promise<{ executionId: string }> {
    try {
      logger.info('Executing workflow in n8n', { workflowId });

      const response = await this.client.post(`/workflows/${workflowId}/execute`, {
        data: inputData || {},
      });

      const executionId = response.data.executionId;
      logger.info('Workflow execution started', { executionId });

      return { executionId };
    } catch (error) {
      logger.error('Workflow execution failed', { error, workflowId });
      throw new Error(`Failed to execute workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<{
    status: 'running' | 'success' | 'error' | 'waiting';
    data?: Record<string, unknown>;
    error?: string;
  }> {
    try {
      const response = await this.client.get(`/executions/${executionId}`);
      return {
        status: response.data.status,
        data: response.data.data,
        error: response.data.error,
      };
    } catch (error) {
      logger.error('Failed to get execution status', { error, executionId });
      throw new Error(`Failed to get execution status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all workflows
   */
  async listWorkflows(): Promise<Array<{ id: string; name: string; active: boolean; createdAt: string }>> {
    try {
      const response = await this.client.get('/workflows');
      return response.data.data || [];
    } catch (error) {
      logger.error('Failed to list workflows', { error });
      throw new Error(`Failed to list workflows: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate workflow structure
   */
  validateWorkflow(workflow: N8nWorkflow): WorkflowValidationResponse {
    const errors: string[] = [];
    const warnings: string[] = [];
    const nodeResults: Array<{
      id: string;
      name: string;
      type: string;
      isValid: boolean;
      errors: string[];
    }> = [];
    const connectionResults: Array<{
      from: string;
      to: string;
      isValid: boolean;
      errors: string[];
    }> = [];

    // Validate workflow structure
    if (!workflow.name || workflow.name.trim() === '') {
      errors.push('Workflow name is required');
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }

    if (!workflow.connections) {
      errors.push('Workflow must have connections object');
    }

    // Validate nodes
    workflow.nodes?.forEach((node) => {
      const nodeErrors: string[] = [];

      if (!node.id) {
        nodeErrors.push('Node ID is required');
      }

      if (!node.name) {
        nodeErrors.push('Node name is required');
      }

      if (!node.type) {
        nodeErrors.push('Node type is required');
      }

      if (!node.position || !Array.isArray(node.position) || node.position.length !== 2) {
        nodeErrors.push('Node position must be [x, y] coordinates');
      }

      nodeResults.push({
        id: node.id,
        name: node.name,
        type: node.type,
        isValid: nodeErrors.length === 0,
        errors: nodeErrors,
      });
    });

    // Validate connections
    if (workflow.connections) {
      Object.entries(workflow.connections).forEach(([fromNodeId, connections]) => {
        (connections as any).forEach((connectionGroup: any) => {
          connectionGroup.forEach((connection: any) => {
            const connectionErrors: string[] = [];

            const fromNode = workflow.nodes?.find((n) => n.id === fromNodeId);
            const toNode = workflow.nodes?.find((n) => n.id === connection.node);

            if (!fromNode) {
              connectionErrors.push(`Source node ${fromNodeId} not found`);
            }

            if (!toNode) {
              connectionErrors.push(`Target node ${connection.node} not found`);
            }

            connectionResults.push({
              from: fromNodeId,
              to: connection.node,
              isValid: connectionErrors.length === 0,
              errors: connectionErrors,
            });
          });
        });
      });
    }

    // Check for orphan nodes (no connections)
    const connectedNodeIds = new Set<string>();
    Object.values(workflow.connections || {}).forEach((conns: any) => {
      conns.forEach((group: any) => {
        group.forEach((conn: any) => {
          connectedNodeIds.add(conn.node);
        });
      });
    });

    workflow.nodes?.forEach((node) => {
      if (!connectedNodeIds.has(node.id) && workflow.connections![node.id] === undefined) {
        warnings.push(`Node "${node.name}" (${node.id}) is not connected`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      nodes: nodeResults,
      connections: connectionResults,
    };
  }

  /**
   * Create webhook trigger URL
   */
  createWebhookUrl(path: string): string {
    return `${this.webhookUrl}/${path}`;
  }
}

// Export singleton instance
export const n8nService = new N8nService();

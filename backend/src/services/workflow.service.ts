/**
 * ===========================================
 * Workflow Service
 * ===========================================
 */

import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { aiService } from './ai.service';
import { n8nService } from './n8n.service';
import {
  N8nWorkflow,
  WorkflowGenerationRequest,
  WorkflowDeploymentRequest,
  WorkflowExecutionRequest,
  WorkflowValidationResponse,
} from '../schemas';

/**
 * Workflow Service for managing n8n workflows
 */
class WorkflowService {
  /**
   * Generate workflow from natural language
   */
  async generateWorkflow(userId: string, request: WorkflowGenerationRequest) {
    try {
      logger.info('Generating workflow', { userId, name: request.name });

      // Generate workflow using AI
      const generatedWorkflow = await aiService.generateWorkflow(request);

      // Generate description
      const description = await aiService.generateWorkflowDescription(generatedWorkflow);

      // Save workflow to database
      const workflow = await prisma.workflow.create({
        data: {
          userId,
          name: request.name,
          description: request.description || description,
          n8nWorkflowJson: generatedWorkflow as any,
          status: 'DRAFT',
          isDeployed: false,
          version: 1,
        },
      });

      // Create initial version
      await prisma.workflowVersion.create({
        data: {
          workflowId: workflow.id,
          version: 1,
          n8nWorkflowJson: generatedWorkflow as any,
          changeLog: 'Initial version - Generated from AI',
          createdBy: userId,
        },
      });

      logger.info('Workflow generated successfully', { workflowId: workflow.id });

      return workflow;
    } catch (error) {
      logger.error('Workflow generation failed', { error });
      throw error;
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string, userId: string) {
    try {
      const workflow = await prisma.workflow.findFirst({
        where: {
          id: workflowId,
          userId,
        },
        include: {
          versions: {
            orderBy: {
              version: 'desc',
            },
            take: 10,
          },
          executions: {
            orderBy: {
              startedAt: 'desc',
            },
            take: 20,
          },
        },
      });

      if (!workflow) {
        throw new Error('Workflow not found or access denied');
      }

      return workflow;
    } catch (error) {
      logger.error('Failed to get workflow', { error, workflowId });
      throw error;
    }
  }

  /**
   * List workflows for user
   */
  async listWorkflows(
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

      const [workflows, total] = await Promise.all([
        prisma.workflow.findMany({
          where,
          include: {
            _count: {
              select: {
                executions: true,
                campaigns: true,
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.workflow.count({ where }),
      ]);

      return {
        items: workflows,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total,
      };
    } catch (error) {
      logger.error('Failed to list workflows', { error });
      throw error;
    }
  }

  /**
   * Update workflow
   */
  async updateWorkflow(workflowId: string, userId: string, updates: Partial<N8nWorkflow>) {
    try {
      // Verify ownership
      const existing = await prisma.workflow.findFirst({
        where: {
          id: workflowId,
          userId,
        },
      });

      if (!existing) {
        throw new Error('Workflow not found or access denied');
      }

      // Get current workflow data
      const currentWorkflow = existing.n8nWorkflowJson as N8nWorkflow;

      // Merge updates
      const updatedWorkflow = {
        ...currentWorkflow,
        ...updates,
      };

      // Create new version
      const newVersion = existing.version + 1;

      await prisma.$transaction(async (tx) => {
        // Update workflow
        await tx.workflow.update({
          where: { id: workflowId },
          data: {
            n8nWorkflowJson: updatedWorkflow as any,
            version: newVersion,
            updatedAt: new Date(),
          },
        });

        // Create version record
        await tx.workflowVersion.create({
          data: {
            workflowId,
            version: newVersion,
            n8nWorkflowJson: updatedWorkflow as any,
            changeLog: 'Workflow updated',
            createdBy: userId,
          },
        });
      });

      logger.info('Workflow updated successfully', { workflowId, version: newVersion });

      return this.getWorkflow(workflowId, userId);
    } catch (error) {
      logger.error('Workflow update failed', { error });
      throw error;
    }
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string, userId: string) {
    try {
      // Verify ownership
      const workflow = await prisma.workflow.findFirst({
        where: {
          id: workflowId,
          userId,
        },
      });

      if (!workflow) {
        throw new Error('Workflow not found or access denied');
      }

      // Delete from n8n if deployed
      if (workflow.n8nWorkflowId) {
        try {
          await n8nService.deleteWorkflow(workflow.n8nWorkflowId);
        } catch (error) {
          logger.warn('Failed to delete from n8n', { error, n8nWorkflowId: workflow.n8nWorkflowId });
        }
      }

      // Delete from database (cascade will handle versions, executions, etc.)
      await prisma.workflow.delete({
        where: { id: workflowId },
      });

      logger.info('Workflow deleted successfully', { workflowId });

      return { success: true };
    } catch (error) {
      logger.error('Workflow deletion failed', { error });
      throw new Error(`Failed to delete workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deploy workflow to n8n
   */
  async deployWorkflow(workflowId: string, userId: string, options: WorkflowDeploymentRequest) {
    try {
      // Get workflow
      const workflow = await this.getWorkflow(workflowId, userId);

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      const workflowData = workflow.n8nWorkflowJson as N8nWorkflow;

      // Validate workflow
      const validation = n8nService.validateWorkflow(workflowData);
      if (!validation.isValid) {
        throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`);
      }

      // Deploy to n8n
      let n8nWorkflowId = workflow.n8nWorkflowId;
      let deployedUrl = '';

      if (n8nWorkflowId) {
        // Update existing workflow
        await n8nService.updateWorkflow(n8nWorkflowId, workflowData);
      } else {
        // Create new workflow
        const result = await n8nService.deployWorkflow(workflowData);
        n8nWorkflowId = result.id;
        deployedUrl = result.url;
      }

      // Activate if requested
      if (options.activate && n8nWorkflowId) {
        await n8nService.activateWorkflow(n8nWorkflowId);
      }

      // Update database
      await prisma.workflow.update({
        where: { id: workflowId },
        data: {
          n8nWorkflowId,
          status: 'DEPLOYED',
          isDeployed: true,
          lastExecutedAt: new Date(),
        },
      });

      logger.info('Workflow deployed successfully', { workflowId, n8nWorkflowId });

      return {
        workflowId,
        n8nWorkflowId,
        deployedUrl,
        status: 'DEPLOYED',
      };
    } catch (error) {
      logger.error('Workflow deployment failed', { error });
      throw error;
    }
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(workflowId: string, userId: string, options: WorkflowExecutionRequest) {
    try {
      // Get workflow
      const workflow = await this.getWorkflow(workflowId, userId);

      if (!workflow || !workflow.n8nWorkflowId) {
        throw new Error('Workflow not deployed to n8n');
      }

      // Execute in n8n
      const { executionId } = await n8nService.executeWorkflow(workflow.n8nWorkflowId, options.inputData);

      // Create execution record
      const execution = await prisma.execution.create({
        data: {
          workflowId,
          userId,
          status: 'RUNNING',
          logs: {
            n8nExecutionId: executionId,
            inputData: options.inputData || {},
          } as any,
        },
      });

      logger.info('Workflow execution started', { workflowId, executionId });

      return execution;
    } catch (error) {
      logger.error('Workflow execution failed', { error });
      throw error;
    }
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string, userId: string) {
    try {
      const execution = await prisma.execution.findFirst({
        where: {
          id: executionId,
          userId,
        },
      });

      if (!execution) {
        throw new Error('Execution not found');
      }

      // If still running, check n8n status
      if (execution.status === 'RUNNING') {
        const logs = execution.logs as any;
        if (logs?.n8nExecutionId) {
          const n8nStatus = await n8nService.getExecutionStatus(logs.n8nExecutionId);

          // Update execution if status changed
          if (n8nStatus.status !== 'running') {
            const newStatus = n8nStatus.status === 'success' ? 'SUCCESS' : n8nStatus.status.toUpperCase();

            await prisma.execution.update({
              where: { id: executionId },
              data: {
                status: newStatus as any,
                completedAt: new Date(),
                logs: {
                  ...logs,
                  outputData: n8nStatus.data,
                  error: n8nStatus.error,
                } as any,
                errorMessage: n8nStatus.error,
              },
            });

            return { ...execution, status: newStatus, logs: { ...logs, outputData: n8nStatus.data } };
          }
        }
      }

      return execution;
    } catch (error) {
      logger.error('Failed to get execution status', { error, executionId });
      throw error;
    }
  }

  /**
   * Validate workflow
   */
  async validateWorkflow(workflowId: string, userId: string): Promise<WorkflowValidationResponse> {
    try {
      const workflow = await this.getWorkflow(workflowId, userId);

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      const workflowData = workflow.n8nWorkflowJson as N8nWorkflow;
      return n8nService.validateWorkflow(workflowData);
    } catch (error) {
      logger.error('Workflow validation failed', { error });
      throw error;
    }
  }

  /**
   * Get workflow version history
   */
  async getVersionHistory(workflowId: string, userId: string) {
    try {
      const workflow = await prisma.workflow.findFirst({
        where: {
          id: workflowId,
          userId,
        },
        include: {
          versions: {
            orderBy: {
              version: 'desc',
            },
          },
        },
      });

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      return workflow.versions;
    } catch (error) {
      logger.error('Failed to get version history', { error, workflowId });
      throw error;
    }
  }

  /**
   * Restore workflow from version
   */
  async restoreVersion(workflowId: string, userId: string, versionNumber: number) {
    try {
      // Verify ownership
      const workflow = await prisma.workflow.findFirst({
        where: {
          id: workflowId,
          userId,
        },
      });

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Get version to restore
      const version = await prisma.workflowVersion.findFirst({
        where: {
          workflowId,
          version: versionNumber,
        },
      });

      if (!version) {
        throw new Error('Version not found');
      }

      // Create new version with restored content
      const newVersion = workflow.version + 1;

      await prisma.$transaction(async (tx) => {
        await tx.workflow.update({
          where: { id: workflowId },
          data: {
            n8nWorkflowJson: version.n8nWorkflowJson as any,
            version: newVersion,
          },
        });

        await tx.workflowVersion.create({
          data: {
            workflowId,
            version: newVersion,
            n8nWorkflowJson: version.n8nWorkflowJson as any,
            changeLog: `Restored from version ${versionNumber}`,
            createdBy: userId,
          },
        });
      });

      logger.info('Workflow version restored', { workflowId, fromVersion: versionNumber });

      return this.getWorkflow(workflowId, userId);
    } catch (error) {
      logger.error('Version restore failed', { error });
      throw error;
    }
  }
}

// Export singleton instance
export const workflowService = new WorkflowService();

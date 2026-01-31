/**
 * ===========================================
 * Workflow Service Tests
 * ===========================================
 */

import { describe, it, expect, beforeEach, vi } from '@jest/globals';
import { workflowService } from '../../services/workflow.service';
import { aiService } from '../../services/ai.service';
import { n8nService } from '../../services/n8n.service';

// Mock dependencies
vi.mock('../../utils/prisma', () => ({
  prisma: {
    workflow: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    workflowVersion: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    execution: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../../services/ai.service');
vi.mock('../../services/n8n.service');

describe('WorkflowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateWorkflow', () => {
    it('should generate and save workflow', async () => {
      const { prisma } = require('../../utils/prisma');
      const userId = 'user-123';
      const request = {
        name: 'Test Workflow',
        description: 'Test description',
        naturalLanguageInput: 'Create a simple workflow',
      };

      const mockWorkflow = {
        id: 'workflow-123',
        name: 'Test Workflow',
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

      vi.mocked(aiService.generateWorkflow).mockResolvedValue(mockWorkflow as any);
      vi.mocked(aiService.generateWorkflowDescription).mockResolvedValue('Test workflow description');
      vi.mocked(prisma.workflow.create).mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        description: 'Test description',
        userId,
        status: 'DRAFT',
        version: 1,
      });
      vi.mocked(prisma.workflowVersion.create).mockResolvedValue({});

      const result = await workflowService.generateWorkflow(userId, request);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Test Workflow');
      expect(prisma.workflow.create).toHaveBeenCalled();
      expect(prisma.workflowVersion.create).toHaveBeenCalled();
    });

    it('should handle AI generation errors', async () => {
      const userId = 'user-123';
      const request = {
        name: 'Test Workflow',
        naturalLanguageInput: 'Create a workflow',
      };

      vi.mocked(aiService.generateWorkflow).mockRejectedValue(new Error('AI error'));

      await expect(workflowService.generateWorkflow(userId, request)).rejects.toThrow();
    });
  });

  describe('getWorkflow', () => {
    it('should get workflow by ID', async () => {
      const { prisma } = require('../../utils/prisma');
      const mockWorkflow = {
        id: 'workflow-123',
        name: 'Test Workflow',
        userId: 'user-123',
        versions: [],
        executions: [],
      };

      vi.mocked(prisma.workflow.findFirst).mockResolvedValue(mockWorkflow);

      const result = await workflowService.getWorkflow('workflow-123', 'user-123');

      expect(result).toEqual(mockWorkflow);
      expect(prisma.workflow.findFirst).toHaveBeenCalledWith({
        where: { id: 'workflow-123', userId: 'user-123' },
        include: expect.any(Object),
      });
    });

    it('should throw error if workflow not found', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.workflow.findFirst).mockResolvedValue(null);

      await expect(workflowService.getWorkflow('workflow-123', 'user-123')).rejects.toThrow(
        'Workflow not found or access denied'
      );
    });
  });

  describe('listWorkflows', () => {
    it('should list workflows for user', async () => {
      const { prisma } = require('../../utils/prisma');
      const mockWorkflows = [
        { id: 'workflow-1', name: 'Workflow 1' },
        { id: 'workflow-2', name: 'Workflow 2' },
      ];

      vi.mocked(prisma.workflow.findMany).mockResolvedValue(mockWorkflows);
      vi.mocked(prisma.workflow.count).mockResolvedValue(2);

      const result = await workflowService.listWorkflows('user-123');

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total');
      expect(result.items).toHaveLength(2);
    });

    it('should filter by status', async () => {
      const { prisma } = require('../../utils/prisma');

      vi.mocked(prisma.workflow.findMany).mockResolvedValue([]);
      vi.mocked(prisma.workflow.count).mockResolvedValue(0);

      await workflowService.listWorkflows('user-123', { status: 'DEPLOYED' });

      expect(prisma.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'DEPLOYED',
          }),
        })
      );
    });
  });

  describe('deployWorkflow', () => {
    it('should deploy workflow to n8n', async () => {
      const { prisma } = require('../../utils/prisma');
      const mockWorkflow = {
        id: 'workflow-123',
        name: 'Test Workflow',
        n8nWorkflowId: null,
        n8nWorkflowJson: {
          name: 'Test',
          nodes: [{ id: 'node-1', name: 'Node 1', type: 'n8n-nodes-base.noOp', position: [0, 0] }],
          connections: {},
        },
      };

      vi.mocked(prisma.workflow.findFirst).mockResolvedValue(mockWorkflow);
      vi.mocked(n8nService.validateWorkflow).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
        nodes: [],
        connections: [],
      });
      vi.mocked(n8nService.deployWorkflow).mockResolvedValue({
        id: 'n8n-workflow-123',
        url: 'http://n8n.example.com/workflow/n8n-workflow-123',
      });
      vi.mocked(prisma.workflow.update).mockResolvedValue({});

      const result = await workflowService.deployWorkflow('workflow-123', 'user-123', {
        workflowId: 'workflow-123',
        deployToN8n: true,
        activate: false,
      });

      expect(result).toHaveProperty('n8nWorkflowId');
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('DEPLOYED');
    });

    it('should validate workflow before deployment', async () => {
      const { prisma } = require('../../utils/prisma');
      const mockWorkflow = {
        id: 'workflow-123',
        n8nWorkflowJson: { name: 'Invalid', nodes: [], connections: {} },
      };

      vi.mocked(prisma.workflow.findFirst).mockResolvedValue(mockWorkflow);
      vi.mocked(n8nService.validateWorkflow).mockReturnValue({
        isValid: false,
        errors: ['Workflow name is required'],
        warnings: [],
        nodes: [],
        connections: [],
      });

      await expect(
        workflowService.deployWorkflow('workflow-123', 'user-123', {
          workflowId: 'workflow-123',
          deployToN8n: true,
        })
      ).rejects.toThrow('Workflow validation failed');
    });
  });

  describe('executeWorkflow', () => {
    it('should execute workflow', async () => {
      const { prisma } = require('../../utils/prisma');
      const mockWorkflow = {
        id: 'workflow-123',
        n8nWorkflowId: 'n8n-workflow-123',
      };

      vi.mocked(prisma.workflow.findFirst).mockResolvedValue(mockWorkflow);
      vi.mocked(n8nService.executeWorkflow).mockResolvedValue({
        executionId: 'exec-123',
      });
      vi.mocked(prisma.execution.create).mockResolvedValue({
        id: 'exec-123',
        status: 'RUNNING',
      });

      const result = await workflowService.executeWorkflow('workflow-123', 'user-123', {});

      expect(result).toHaveProperty('id');
      expect(result.status).toBe('RUNNING');
    });
  });

  describe('validateWorkflow', () => {
    it('should validate workflow structure', async () => {
      const { prisma } = require('../../utils/prisma');
      const mockWorkflow = {
        id: 'workflow-123',
        n8nWorkflowJson: {
          name: 'Test',
          nodes: [{ id: 'node-1', name: 'Node 1', type: 'n8n-nodes-base.noOp', position: [0, 0] }],
          connections: {},
        },
      };

      vi.mocked(prisma.workflow.findFirst).mockResolvedValue(mockWorkflow);
      vi.mocked(n8nService.validateWorkflow).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
        nodes: [],
        connections: [],
      });

      const result = await workflowService.validateWorkflow('workflow-123', 'user-123');

      expect(result).toHaveProperty('isValid');
      expect(result.isValid).toBe(true);
    });
  });
});

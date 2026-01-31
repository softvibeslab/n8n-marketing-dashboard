/**
 * ===========================================
 * n8n Service Tests
 * ===========================================
 */

import { describe, it, expect, beforeEach, vi } from '@jest/globals';
import { n8nService } from '../../services/n8n.service';
import type { N8nWorkflow } from '../../schemas';

// Mock axios
vi.mock('axios', () => {
  return {
    default: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    })),
  };
});

describe('N8nService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateWorkflow', () => {
    it('should validate a correct workflow', () => {
      const workflow: N8nWorkflow = {
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
            name: 'HTTP Request',
            type: 'n8n-nodes-base.httpRequest',
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
      };

      const result = n8nService.validateWorkflow(workflow);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing workflow name', () => {
      const workflow: N8nWorkflow = {
        name: '',
        nodes: [],
        connections: {},
      };

      const result = n8nService.validateWorkflow(workflow);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Workflow name is required');
    });

    it('should detect missing nodes', () => {
      const workflow: N8nWorkflow = {
        name: 'Test',
        nodes: [],
        connections: {},
      };

      const result = n8nService.validateWorkflow(workflow);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Workflow must have at least one node');
    });

    it('should detect invalid node structure', () => {
      const workflow: N8nWorkflow = {
        name: 'Test',
        nodes: [
          {
            id: '',
            name: '',
            type: '',
            position: [250, 300],
          },
        ] as any,
        connections: {},
      };

      const result = n8nService.validateWorkflow(workflow);

      expect(result.nodes[0].isValid).toBe(false);
      expect(result.nodes[0].errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid connections', () => {
      const workflow: N8nWorkflow = {
        name: 'Test',
        nodes: [
          {
            id: 'node-1',
            name: 'Node 1',
            type: 'n8n-nodes-base.noOp',
            position: [250, 300],
          },
        ],
        connections: {
          'node-1': [
            [
              {
                node: 'non-existent',
                type: 'main',
                index: 0,
              } as any,
            ],
          ],
        },
      };

      const result = n8nService.validateWorkflow(workflow);

      expect(result.connections[0].isValid).toBe(false);
      expect(result.connections[0].errors).toContain('Target node non-existent not found');
    });

    it('should warn about orphan nodes', () => {
      const workflow: N8nWorkflow = {
        name: 'Test',
        nodes: [
          {
            id: 'node-1',
            name: 'Node 1',
            type: 'n8n-nodes-base.noOp',
            position: [250, 300],
          },
          {
            id: 'node-2',
            name: 'Orphan Node',
            type: 'n8n-nodes-base.noOp',
            position: [450, 300],
          },
        ],
        connections: {
          'node-1': [],
        },
      };

      const result = n8nService.validateWorkflow(workflow);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.includes('Orphan Node'))).toBe(true);
    });
  });

  describe('deployWorkflow', () => {
    it('should deploy workflow to n8n', async () => {
      const axios = require('axios');
      const mockClient = {
        post: vi.fn().mockResolvedValue({
          data: {
            id: 'n8n-workflow-123',
          },
        }),
      };
      axios.default.mockImplementation(() => mockClient);

      const workflow: N8nWorkflow = {
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node-1',
            name: 'Node 1',
            type: 'n8n-nodes-base.noOp',
            position: [250, 300],
          },
        ],
        connections: {},
      };

      const result = await n8nService.deployWorkflow(workflow);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('url');
      expect(result.id).toBe('n8n-workflow-123');
    });

    it('should handle deployment errors', async () => {
      const axios = require('axios');
      const mockClient = {
        post: vi.fn().mockRejectedValue(new Error('Network error')),
      };
      axios.default.mockImplementation(() => mockClient);

      const workflow: N8nWorkflow = {
        name: 'Test',
        nodes: [],
        connections: {},
      };

      await expect(n8nService.deployWorkflow(workflow)).rejects.toThrow('Failed to deploy workflow');
    });
  });

  describe('executeWorkflow', () => {
    it('should execute workflow', async () => {
      const axios = require('axios');
      const mockClient = {
        post: vi.fn().mockResolvedValue({
          data: {
            executionId: 'exec-123',
          },
        }),
      };
      axios.default.mockImplementation(() => mockClient);

      const result = await n8nService.executeWorkflow('workflow-123', { test: 'data' });

      expect(result).toHaveProperty('executionId');
      expect(result.executionId).toBe('exec-123');
    });
  });

  describe('getExecutionStatus', () => {
    it('should get execution status', async () => {
      const axios = require('axios');
      const mockClient = {
        get: vi.fn().mockResolvedValue({
          data: {
            status: 'success',
            data: { result: 'completed' },
          },
        }),
      };
      axios.default.mockImplementation(() => mockClient);

      const result = await n8nService.getExecutionStatus('exec-123');

      expect(result).toHaveProperty('status');
      expect(result.status).toBe('success');
    });
  });
});

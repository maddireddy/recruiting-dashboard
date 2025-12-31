/**
 * Workflow Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowService } from '../workflow.service';
import type { WorkflowTemplate } from '../workflow.templates';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('WorkflowService', () => {
  let service: WorkflowService;

  beforeEach(() => {
    localStorageMock.clear();
    service = new WorkflowService();
  });

  describe('installTemplate', () => {
    it('should install a workflow template', async () => {
      const template: WorkflowTemplate = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'A test workflow',
        category: 'candidate',
        isActive: true,
        definition: {
          id: 'test',
          name: 'Test',
          version: '1.0.0',
          description: 'Test workflow',
          states: [
            {
              name: 'start',
              type: 'start',
              transitions: [{ to: 'end', event: 'complete' }],
            },
            {
              name: 'end',
              type: 'end',
            },
          ],
          initialState: 'start',
        },
      };

      const workflow = await service.installTemplate(template);

      expect(workflow).toBeDefined();
      expect(workflow.id).toBe('workflow_test-workflow');
      expect(workflow.name).toBe('Test');
      expect(workflow.createdAt).toBeDefined();
    });

    it('should persist workflow to localStorage', async () => {
      const template: WorkflowTemplate = {
        id: 'persist-test',
        name: 'Persist Test',
        description: 'Test persistence',
        category: 'candidate',
        isActive: true,
        definition: {
          id: 'persist',
          name: 'Persist',
          version: '1.0.0',
          description: 'Test',
          states: [
            { name: 'start', type: 'start', transitions: [] },
            { name: 'end', type: 'end' },
          ],
          initialState: 'start',
        },
      };

      await service.installTemplate(template);

      const stored = localStorage.getItem('recruiting_workflows');
      expect(stored).toBeDefined();

      const workflows = JSON.parse(stored!);
      expect(workflows).toHaveLength(1);
      expect(workflows[0].id).toBe('workflow_persist-test');
    });
  });

  describe('getInstalledWorkflows', () => {
    it('should return empty array when no workflows installed', async () => {
      const workflows = await service.getInstalledWorkflows();
      expect(workflows).toEqual([]);
    });

    it('should return installed workflows from localStorage', async () => {
      const mockWorkflow = {
        id: 'workflow_test',
        name: 'Test',
        version: '1.0.0',
        description: 'Test',
        states: [],
        initialState: 'start',
      };

      localStorage.setItem('recruiting_workflows', JSON.stringify([mockWorkflow]));

      const workflows = await service.getInstalledWorkflows();
      expect(workflows).toHaveLength(1);
      expect(workflows[0].id).toBe('workflow_test');
    });
  });

  describe('uninstallWorkflow', () => {
    it('should remove workflow from storage', async () => {
      const mockWorkflow = {
        id: 'workflow_remove-me',
        name: 'Remove',
        version: '1.0.0',
        description: 'Test',
        states: [],
        initialState: 'start',
      };

      localStorage.setItem('recruiting_workflows', JSON.stringify([mockWorkflow]));

      await service.uninstallWorkflow('workflow_remove-me');

      const stored = localStorage.getItem('recruiting_workflows');
      const workflows = JSON.parse(stored!);
      expect(workflows).toHaveLength(0);
    });

    it('should not throw if workflow does not exist', async () => {
      await expect(service.uninstallWorkflow('non-existent')).resolves.not.toThrow();
    });
  });

  describe('getWorkflowMetrics', () => {
    it('should return metrics for a workflow', async () => {
      const metrics = await service.getWorkflowMetrics('test-workflow');

      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('activeInstances');
      expect(metrics).toHaveProperty('completedInstances');
      expect(metrics).toHaveProperty('averageDuration');
    });

    it('should return zero metrics for new workflow', async () => {
      const metrics = await service.getWorkflowMetrics('new-workflow');

      expect(metrics.activeInstances).toBe(0);
      expect(metrics.completedInstances).toBe(0);
      expect(metrics.averageDuration).toBe(0);
    });
  });

  describe('createInstance', () => {
    it('should create a workflow instance', async () => {
      const instance = await service.createInstance('test-workflow', {
        candidateId: '123',
        candidateName: 'John Doe',
      });

      expect(instance).toBeDefined();
      expect(instance.workflowId).toBe('test-workflow');
      expect(instance.metadata.candidateId).toBe('123');
      expect(instance.currentState).toBeDefined();
    });

    it('should generate unique instance IDs', async () => {
      const instance1 = await service.createInstance('test-workflow', {});
      const instance2 = await service.createInstance('test-workflow', {});

      expect(instance1.id).not.toBe(instance2.id);
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage.setItem to throw
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const template: WorkflowTemplate = {
        id: 'error-test',
        name: 'Error Test',
        description: 'Test error handling',
        category: 'candidate',
        isActive: true,
        definition: {
          id: 'error',
          name: 'Error',
          version: '1.0.0',
          description: 'Test',
          states: [
            { name: 'start', type: 'start', transitions: [] },
          ],
          initialState: 'start',
        },
      };

      // Should not throw, but workflow will still be registered in engine
      await expect(service.installTemplate(template)).resolves.toBeDefined();

      vi.restoreAllMocks();
    });
  });
});

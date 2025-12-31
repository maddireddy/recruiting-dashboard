/**
 * Workflow Service
 *
 * High-level service for managing workflows and workflow instances.
 * Provides abstraction over the workflow engine and prepares for backend integration.
 */

import { workflowEngine } from '../workflow.engine';
import { logger } from '../../lib/logger';
import type {
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowTransition,
  WorkflowTemplate,
  WorkflowEntityType,
} from '../../types/workflow';

export class WorkflowService {
  /**
   * Install a workflow template
   */
  async installTemplate(template: WorkflowTemplate): Promise<WorkflowDefinition> {
    try {
      logger.info('Installing workflow template', {
        templateId: template.id,
        name: template.name,
      });

      const workflowDefinition: WorkflowDefinition = {
        ...template.definition,
        id: `workflow_${template.id}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: this.getCurrentUserId(),
      };

      // Register with engine
      workflowEngine.registerWorkflow(workflowDefinition);

      // Persist to storage
      this.saveWorkflowToStorage(workflowDefinition);

      logger.success('Workflow template installed', {
        workflowId: workflowDefinition.id,
      });

      return workflowDefinition;
    } catch (error) {
      logger.error('Failed to install workflow template', error, {
        templateId: template.id,
      });
      throw error;
    }
  }

  /**
   * Uninstall a workflow
   */
  async uninstallWorkflow(workflowId: string): Promise<void> {
    try {
      logger.info('Uninstalling workflow', { workflowId });

      // Unregister from engine
      workflowEngine.unregisterWorkflow(workflowId);

      // Remove from storage
      this.removeWorkflowFromStorage(workflowId);

      logger.success('Workflow uninstalled', { workflowId });
    } catch (error) {
      logger.error('Failed to uninstall workflow', error, { workflowId });
      throw error;
    }
  }

  /**
   * Get all installed workflows
   */
  async getInstalledWorkflows(): Promise<WorkflowDefinition[]> {
    try {
      // Load from storage first
      this.loadWorkflowsFromStorage();

      // Return from engine
      return workflowEngine.getAll();
    } catch (error) {
      logger.error('Failed to get installed workflows', error);
      return [];
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<WorkflowDefinition | null> {
    const workflow = workflowEngine.getWorkflow(workflowId);
    return workflow || null;
  }

  /**
   * Create a workflow instance for an entity
   */
  async createInstance(
    workflowId: string,
    entityType: WorkflowEntityType,
    entityId: string,
    metadata?: Record<string, any>
  ): Promise<WorkflowInstance> {
    try {
      logger.info('Creating workflow instance', {
        workflowId,
        entityType,
        entityId,
      });

      const userId = this.getCurrentUserId();
      const instance = workflowEngine.createInstance(
        workflowId,
        entityType,
        entityId,
        userId,
        metadata
      );

      // Persist instance
      this.saveInstanceToStorage(instance);

      logger.success('Workflow instance created', {
        instanceId: instance.id,
        workflowId,
      });

      return instance;
    } catch (error) {
      logger.error('Failed to create workflow instance', error, {
        workflowId,
        entityType,
        entityId,
      });
      throw error;
    }
  }

  /**
   * Get available transitions for an instance
   */
  async getAvailableTransitions(instanceId: string): Promise<WorkflowTransition[]> {
    const userId = this.getCurrentUserId();
    return workflowEngine.getAvailableTransitions(instanceId, userId);
  }

  /**
   * Execute a workflow transition
   */
  async executeTransition(
    instanceId: string,
    transitionId: string,
    comments?: string
  ): Promise<WorkflowInstance> {
    try {
      const userId = this.getCurrentUserId();
      const userName = this.getCurrentUserName();

      logger.info('Executing workflow transition', {
        instanceId,
        transitionId,
        userId,
      });

      const instance = await workflowEngine.executeTransition(
        instanceId,
        transitionId,
        userId,
        userName,
        comments
      );

      // Update storage
      this.saveInstanceToStorage(instance);

      logger.success('Workflow transition executed', {
        instanceId,
        transitionId,
        newState: instance.currentState,
      });

      return instance;
    } catch (error) {
      logger.error('Failed to execute workflow transition', error, {
        instanceId,
        transitionId,
      });
      throw error;
    }
  }

  /**
   * Get workflow instance by ID
   */
  async getInstance(instanceId: string): Promise<WorkflowInstance | null> {
    // Load instances from storage first
    this.loadInstancesFromStorage();

    const instance = workflowEngine.getInstance(instanceId);
    return instance || null;
  }

  /**
   * Get all instances for an entity
   */
  async getInstancesByEntity(
    entityType: WorkflowEntityType,
    entityId: string
  ): Promise<WorkflowInstance[]> {
    // Load instances from storage
    this.loadInstancesFromStorage();

    return workflowEngine.getInstancesByEntity(entityType, entityId);
  }

  /**
   * Get workflow metrics
   */
  async getWorkflowMetrics(workflowId: string) {
    return workflowEngine.getMetrics(workflowId);
  }

  /**
   * Get all workflow metrics
   */
  async getAllWorkflowMetrics() {
    const workflows = workflowEngine.getAll();
    return workflows.map((workflow) => ({
      workflowId: workflow.id,
      workflowName: workflow.name,
      ...workflowEngine.getMetrics(workflow.id),
    }));
  }

  // ============================================================================
  // Storage Methods (localStorage for now, will be replaced with API calls)
  // ============================================================================

  private readonly STORAGE_KEYS = {
    WORKFLOWS: 'recruiting_workflows',
    INSTANCES: 'recruiting_workflow_instances',
  };

  /**
   * Save workflow to localStorage
   */
  private saveWorkflowToStorage(workflow: WorkflowDefinition): void {
    try {
      const workflows = this.getStoredWorkflows();
      const existingIndex = workflows.findIndex((w) => w.id === workflow.id);

      if (existingIndex >= 0) {
        workflows[existingIndex] = workflow;
      } else {
        workflows.push(workflow);
      }

      localStorage.setItem(
        this.STORAGE_KEYS.WORKFLOWS,
        JSON.stringify(workflows)
      );

      logger.debug('Workflow saved to storage', { workflowId: workflow.id });
    } catch (error) {
      logger.warn('Failed to save workflow to storage', { error });
    }
  }

  /**
   * Remove workflow from localStorage
   */
  private removeWorkflowFromStorage(workflowId: string): void {
    try {
      const workflows = this.getStoredWorkflows();
      const filtered = workflows.filter((w) => w.id !== workflowId);

      localStorage.setItem(
        this.STORAGE_KEYS.WORKFLOWS,
        JSON.stringify(filtered)
      );

      logger.debug('Workflow removed from storage', { workflowId });
    } catch (error) {
      logger.warn('Failed to remove workflow from storage', { error });
    }
  }

  /**
   * Load workflows from localStorage into engine
   */
  private loadWorkflowsFromStorage(): void {
    try {
      const workflows = this.getStoredWorkflows();

      workflows.forEach((workflow) => {
        // Only register if not already in engine
        if (!workflowEngine.getWorkflow(workflow.id)) {
          workflowEngine.registerWorkflow(workflow);
        }
      });

      if (workflows.length > 0) {
        logger.debug('Loaded workflows from storage', {
          count: workflows.length,
        });
      }
    } catch (error) {
      logger.warn('Failed to load workflows from storage', { error });
    }
  }

  /**
   * Get workflows from localStorage
   */
  private getStoredWorkflows(): WorkflowDefinition[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.WORKFLOWS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.warn('Failed to parse stored workflows', { error });
      return [];
    }
  }

  /**
   * Save instance to localStorage
   */
  private saveInstanceToStorage(instance: WorkflowInstance): void {
    try {
      const instances = this.getStoredInstances();
      const existingIndex = instances.findIndex((i) => i.id === instance.id);

      if (existingIndex >= 0) {
        instances[existingIndex] = instance;
      } else {
        instances.push(instance);
      }

      localStorage.setItem(
        this.STORAGE_KEYS.INSTANCES,
        JSON.stringify(instances)
      );

      logger.debug('Instance saved to storage', { instanceId: instance.id });
    } catch (error) {
      logger.warn('Failed to save instance to storage', { error });
    }
  }

  /**
   * Load instances from localStorage into engine
   */
  private loadInstancesFromStorage(): void {
    try {
      const instances = this.getStoredInstances();

      // Note: In a real implementation, we'd have a method to load instances
      // into the engine. For now, this is a placeholder.

      if (instances.length > 0) {
        logger.debug('Loaded instances from storage', {
          count: instances.length,
        });
      }
    } catch (error) {
      logger.warn('Failed to load instances from storage', { error });
    }
  }

  /**
   * Get instances from localStorage
   */
  private getStoredInstances(): WorkflowInstance[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.INSTANCES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.warn('Failed to parse stored instances', { error });
      return [];
    }
  }

  /**
   * Get current user ID
   */
  private getCurrentUserId(): string {
    return localStorage.getItem('userId') || 'system';
  }

  /**
   * Get current user name
   */
  private getCurrentUserName(): string {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.name || 'System User';
      }
    } catch (error) {
      // Ignore
    }
    return 'System User';
  }

  /**
   * Clear all workflow data (useful for testing)
   */
  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.WORKFLOWS);
      localStorage.removeItem(this.STORAGE_KEYS.INSTANCES);

      logger.info('All workflow data cleared');
    } catch (error) {
      logger.error('Failed to clear workflow data', error);
    }
  }
}

// Export singleton instance
export const workflowService = new WorkflowService();

/**
 * BPM Workflow Engine
 *
 * Core engine for managing workflow execution, state transitions,
 * validation, and automation
 */

import type {
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowTransition,
  WorkflowCondition,
  WorkflowAction,
  WorkflowHistoryEntry,
  WorkflowEntityType,
} from '../types/workflow';
import { logger } from '../lib/logger';
import { actionHandlerRegistry } from './workflow/action-handlers';

export class WorkflowEngine {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private instances: Map<string, WorkflowInstance> = new Map();

  /**
   * Register a workflow definition
   */
  registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
    logger.workflow('Workflow registered', {
      workflowId: workflow.id,
      name: workflow.name,
      entityType: workflow.entityType,
    });
  }

  /**
   * Unregister a workflow definition
   */
  unregisterWorkflow(workflowId: string): void {
    const removed = this.workflows.delete(workflowId);
    if (removed) {
      logger.workflow('Workflow unregistered', { workflowId });
    } else {
      logger.warn('Attempted to unregister non-existent workflow', { workflowId });
    }
  }

  /**
   * Get all registered workflows
   */
  getAll(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Create a new workflow instance for an entity
   */
  createInstance(
    workflowId: string,
    entityType: WorkflowEntityType,
    entityId: string,
    assignedTo?: string,
    metadata?: Record<string, any>
  ): WorkflowInstance {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const instance: WorkflowInstance = {
      id: `${entityType}_${entityId}_${Date.now()}`,
      workflowId,
      entityType,
      entityId,
      currentState: workflow.initialState,
      startedAt: new Date().toISOString(),
      assignedTo,
      history: [
        {
          id: `history_${Date.now()}`,
          timestamp: new Date().toISOString(),
          fromState: '',
          toState: workflow.initialState,
          transitionName: 'Initial State',
          performedBy: assignedTo || 'system',
          performedByName: 'System',
          automated: true,
        },
      ],
      metadata: metadata || {},
    };

    // Calculate SLA deadline if configured
    if (workflow.settings.slaDays) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + workflow.settings.slaDays);
      instance.slaDeadline = deadline.toISOString();
    }

    this.instances.set(instance.id, instance);
    return instance;
  }

  /**
   * Get available transitions from current state
   */
  getAvailableTransitions(instanceId: string, userId: string): WorkflowTransition[] {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    const workflow = this.workflows.get(instance.workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${instance.workflowId} not found`);
    }

    return workflow.transitions.filter((transition) => {
      // Must start from current state
      if (transition.fromState !== instance.currentState) {
        return false;
      }

      // Check conditions
      if (transition.conditions && transition.conditions.length > 0) {
        return this.evaluateConditions(transition.conditions, instance, userId);
      }

      return true;
    });
  }

  /**
   * Execute a workflow transition
   */
  async executeTransition(
    instanceId: string,
    transitionId: string,
    userId: string,
    userName: string,
    comments?: string
  ): Promise<WorkflowInstance> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    const workflow = this.workflows.get(instance.workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${instance.workflowId} not found`);
    }

    const transition = workflow.transitions.find((t) => t.id === transitionId);
    if (!transition) {
      throw new Error(`Transition ${transitionId} not found`);
    }

    // Validate transition is available
    const availableTransitions = this.getAvailableTransitions(instanceId, userId);
    if (!availableTransitions.find((t) => t.id === transitionId)) {
      throw new Error(`Transition ${transitionId} is not available from current state`);
    }

    // Check if comments are required
    if (workflow.settings.requireComments && !comments) {
      throw new Error('Comments are required for this transition');
    }

    // Calculate duration in previous state
    const lastEntry = instance.history[instance.history.length - 1];
    const duration = Date.now() - new Date(lastEntry.timestamp).getTime();

    // Create history entry
    const historyEntry: WorkflowHistoryEntry = {
      id: `history_${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromState: instance.currentState,
      toState: transition.toState,
      transitionName: transition.label,
      performedBy: userId,
      performedByName: userName,
      comments,
      automated: false,
      duration,
    };

    // Update instance
    instance.previousState = instance.currentState;
    instance.currentState = transition.toState;
    instance.history.push(historyEntry);

    // Check if final state
    if (workflow.finalStates.includes(transition.toState)) {
      instance.completedAt = new Date().toISOString();
    }

    // Check if overdue
    if (instance.slaDeadline) {
      instance.isOverdue = new Date() > new Date(instance.slaDeadline);
    }

    // Execute transition actions
    if (transition.actions && transition.actions.length > 0) {
      await this.executeActions(transition.actions, instance, workflow);
    }

    this.instances.set(instanceId, instance);
    return instance;
  }

  /**
   * Evaluate workflow conditions
   */
  private evaluateConditions(
    conditions: WorkflowCondition[],
    instance: WorkflowInstance,
    userId: string
  ): boolean {
    return conditions.every((condition) => {
      switch (condition.type) {
        case 'field':
          return this.evaluateFieldCondition(condition, instance);
        case 'role':
          // Would integrate with user service to check roles
          return true;
        case 'time':
          return this.evaluateTimeCondition(condition, instance);
        default:
          return true;
      }
    });
  }

  /**
   * Evaluate field condition
   */
  private evaluateFieldCondition(condition: WorkflowCondition, instance: WorkflowInstance): boolean {
    if (!condition.field) return true;

    const fieldValue = instance.metadata[condition.field];

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      default:
        return true;
    }
  }

  /**
   * Evaluate time condition
   */
  private evaluateTimeCondition(condition: WorkflowCondition, instance: WorkflowInstance): boolean {
    const lastEntry = instance.history[instance.history.length - 1];
    const timeInState = Date.now() - new Date(lastEntry.timestamp).getTime();

    if (condition.operator === 'greater_than') {
      return timeInState > Number(condition.value);
    }
    if (condition.operator === 'less_than') {
      return timeInState < Number(condition.value);
    }

    return true;
  }

  /**
   * Execute workflow actions
   */
  private async executeActions(
    actions: WorkflowAction[],
    instance: WorkflowInstance,
    workflow: WorkflowDefinition
  ): Promise<void> {
    for (const action of actions) {
      try {
        await this.executeAction(action, instance, workflow);
      } catch (error) {
        logger.error('Failed to execute workflow action', error, {
          actionId: action.id,
          actionType: action.type,
          instanceId: instance.id,
        });
        // Continue with other actions even if one fails
      }
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(
    action: WorkflowAction,
    instance: WorkflowInstance,
    workflow: WorkflowDefinition
  ): Promise<void> {
    // Handle built-in actions that modify state directly
    switch (action.type) {
      case 'update_field':
        if (action.config.field) {
          instance.metadata[action.config.field] = action.config.value;
          logger.workflow('Updated field', {
            field: action.config.field,
            value: action.config.value,
            instanceId: instance.id,
          });
        }
        return;

      case 'assign_user':
        instance.assignedTo = action.config.userId;
        instance.assignedToName = action.config.userName;
        logger.workflow('Assigned user', {
          userId: action.config.userId,
          userName: action.config.userName,
          instanceId: instance.id,
        });
        return;
    }

    // Use action handler registry for all other actions
    await actionHandlerRegistry.executeAction(action, instance);
  }

  /**
   * Get workflow instance by ID
   */
  getInstance(instanceId: string): WorkflowInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Get all instances for an entity
   */
  getInstancesByEntity(entityType: WorkflowEntityType, entityId: string): WorkflowInstance[] {
    return Array.from(this.instances.values()).filter(
      (instance) => instance.entityType === entityType && instance.entityId === entityId
    );
  }

  /**
   * Get workflow definition
   */
  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Check if instance can transition to specific state
   */
  canTransitionTo(instanceId: string, toState: string, userId: string): boolean {
    const availableTransitions = this.getAvailableTransitions(instanceId, userId);
    return availableTransitions.some((t) => t.toState === toState);
  }

  /**
   * Get workflow metrics
   */
  getMetrics(workflowId: string): {
    totalInstances: number;
    activeInstances: number;
    completedInstances: number;
    averageDuration: number;
  } {
    const instances = Array.from(this.instances.values()).filter(
      (i) => i.workflowId === workflowId
    );

    const completed = instances.filter((i) => i.completedAt);
    const active = instances.filter((i) => !i.completedAt);

    const totalDuration = completed.reduce((sum, instance) => {
      if (instance.completedAt) {
        const duration = new Date(instance.completedAt).getTime() - new Date(instance.startedAt).getTime();
        return sum + duration;
      }
      return sum;
    }, 0);

    const averageDuration = completed.length > 0
      ? totalDuration / completed.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      totalInstances: instances.length,
      activeInstances: active.length,
      completedInstances: completed.length,
      averageDuration,
    };
  }
}

// Singleton instance
export const workflowEngine = new WorkflowEngine();
export default workflowEngine;

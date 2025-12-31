/**
 * Workflow Action Handlers
 *
 * Implementations for workflow actions (email, notifications, webhooks, etc.)
 */

import { logger } from '../../lib/logger';
import type { WorkflowAction, WorkflowInstance } from '../../types/workflow';
import { api } from '../api';

export interface ActionHandler {
  execute(
    action: WorkflowAction,
    instance: WorkflowInstance
  ): Promise<void>;
}

/**
 * Email Action Handler
 * Sends emails using the backend email service
 */
export class EmailActionHandler implements ActionHandler {
  async execute(action: WorkflowAction, instance: WorkflowInstance): Promise<void> {
    try {
      const { recipients, template, subject, body } = action.config;

      logger.info('Sending workflow email', {
        recipients,
        template,
        instanceId: instance.id,
      });

      // In development, just log
      if (import.meta.env.DEV) {
        logger.workflow('Email would be sent', {
          to: recipients,
          subject: subject || template,
          instanceId: instance.id,
          entityType: instance.entityType,
          entityId: instance.entityId,
        });
        return;
      }

      // In production, call backend API
      await api.post('/workflows/actions/email', {
        recipients,
        template,
        subject,
        body,
        instanceId: instance.id,
        workflowId: instance.workflowId,
        metadata: instance.metadata,
      });

      logger.success('Workflow email sent', {
        recipients,
        instanceId: instance.id,
      });
    } catch (error) {
      logger.error('Failed to send workflow email', error, {
        actionId: action.id,
        instanceId: instance.id,
      });
      throw error;
    }
  }
}

/**
 * Notification Action Handler
 * Creates in-app notifications
 */
export class NotificationActionHandler implements ActionHandler {
  async execute(action: WorkflowAction, instance: WorkflowInstance): Promise<void> {
    try {
      const { template, recipients, title, message } = action.config;

      logger.info('Creating workflow notification', {
        template,
        recipients,
        instanceId: instance.id,
      });

      // In development, just log
      if (import.meta.env.DEV) {
        logger.workflow('Notification would be created', {
          title: title || template,
          message: message || `Workflow state changed to ${instance.currentState}`,
          recipients,
          instanceId: instance.id,
        });
        return;
      }

      // In production, call notification service
      await api.post('/notifications', {
        title: title || template,
        message: message || `Workflow transitioned to ${instance.currentState}`,
        recipients,
        type: 'workflow',
        metadata: {
          instanceId: instance.id,
          workflowId: instance.workflowId,
          entityType: instance.entityType,
          entityId: instance.entityId,
        },
      });

      logger.success('Workflow notification created', {
        recipients,
        instanceId: instance.id,
      });
    } catch (error) {
      logger.error('Failed to create workflow notification', error, {
        actionId: action.id,
        instanceId: instance.id,
      });
      throw error;
    }
  }
}

/**
 * Webhook Action Handler
 * Triggers external webhooks
 */
export class WebhookActionHandler implements ActionHandler {
  async execute(action: WorkflowAction, instance: WorkflowInstance): Promise<void> {
    try {
      const { webhookUrl, method = 'POST', headers = {} } = action.config;

      logger.info('Triggering workflow webhook', {
        url: webhookUrl,
        method,
        instanceId: instance.id,
      });

      // Prepare webhook payload
      const payload = {
        event: 'workflow.transition',
        instanceId: instance.id,
        workflowId: instance.workflowId,
        entityType: instance.entityType,
        entityId: instance.entityId,
        currentState: instance.currentState,
        previousState: instance.previousState,
        timestamp: new Date().toISOString(),
        metadata: instance.metadata,
      };

      // In development, just log
      if (import.meta.env.DEV) {
        logger.workflow('Webhook would be triggered', {
          url: webhookUrl,
          method,
          payload,
        });
        return;
      }

      // In production, make the webhook request
      const response = await fetch(webhookUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      logger.success('Workflow webhook triggered', {
        url: webhookUrl,
        status: response.status,
        instanceId: instance.id,
      });
    } catch (error) {
      logger.error('Failed to trigger workflow webhook', error, {
        actionId: action.id,
        webhookUrl: action.config.webhookUrl,
        instanceId: instance.id,
      });
      throw error;
    }
  }
}

/**
 * Task Creation Action Handler
 * Creates tasks in the task management system
 */
export class TaskActionHandler implements ActionHandler {
  async execute(action: WorkflowAction, instance: WorkflowInstance): Promise<void> {
    try {
      const { title, description, assignedTo, dueDate, priority } = action.config;

      logger.info('Creating workflow task', {
        title,
        assignedTo,
        instanceId: instance.id,
      });

      // In development, just log
      if (import.meta.env.DEV) {
        logger.workflow('Task would be created', {
          title,
          description,
          assignedTo,
          dueDate,
          priority: priority || 'normal',
          instanceId: instance.id,
        });
        return;
      }

      // In production, call task service
      await api.post('/tasks', {
        title,
        description,
        assignedTo,
        dueDate,
        priority: priority || 'normal',
        source: 'workflow',
        metadata: {
          instanceId: instance.id,
          workflowId: instance.workflowId,
          entityType: instance.entityType,
          entityId: instance.entityId,
        },
      });

      logger.success('Workflow task created', {
        title,
        instanceId: instance.id,
      });
    } catch (error) {
      logger.error('Failed to create workflow task', error, {
        actionId: action.id,
        instanceId: instance.id,
      });
      throw error;
    }
  }
}

/**
 * Action Handler Registry
 * Maps action types to their handlers
 */
class ActionHandlerRegistry {
  private handlers: Map<string, ActionHandler> = new Map();

  constructor() {
    // Register default handlers
    this.register('email', new EmailActionHandler());
    this.register('notification', new NotificationActionHandler());
    this.register('webhook', new WebhookActionHandler());
    this.register('create_task', new TaskActionHandler());
  }

  /**
   * Register a custom action handler
   */
  register(actionType: string, handler: ActionHandler): void {
    this.handlers.set(actionType, handler);
    logger.debug('Action handler registered', { actionType });
  }

  /**
   * Get handler for action type
   */
  getHandler(actionType: string): ActionHandler | undefined {
    return this.handlers.get(actionType);
  }

  /**
   * Execute an action
   */
  async executeAction(
    action: WorkflowAction,
    instance: WorkflowInstance
  ): Promise<void> {
    const handler = this.getHandler(action.type);

    if (!handler) {
      logger.warn('No handler found for action type', {
        actionType: action.type,
        actionId: action.id,
      });
      return;
    }

    try {
      await handler.execute(action, instance);
    } catch (error) {
      logger.error('Action execution failed', error, {
        actionType: action.type,
        actionId: action.id,
        instanceId: instance.id,
      });
      // Don't throw - allow workflow to continue
    }
  }

  /**
   * Execute multiple actions in sequence
   */
  async executeActions(
    actions: WorkflowAction[],
    instance: WorkflowInstance
  ): Promise<void> {
    for (const action of actions) {
      await this.executeAction(action, instance);
    }
  }
}

// Export singleton instance
export const actionHandlerRegistry = new ActionHandlerRegistry();

// Export handler classes for custom implementations
export { EmailActionHandler, NotificationActionHandler, WebhookActionHandler, TaskActionHandler };

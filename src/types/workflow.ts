/**
 * BPM Workflow System - Type Definitions
 *
 * Comprehensive workflow management for recruiting operations
 * Supports state machines, automation rules, and workflow templates
 */

// ==================== Core Workflow Types ====================

export type WorkflowEntityType =
  | 'candidate'
  | 'job'
  | 'submission'
  | 'interview'
  | 'offer'
  | 'timesheet'
  | 'invoice'
  | 'placement'
  | 'onboarding';

export interface WorkflowState {
  id: string;
  name: string;
  label: string;
  description?: string;
  color: string;
  icon?: string;
  type: 'initial' | 'intermediate' | 'final' | 'error';
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface WorkflowTransition {
  id: string;
  name: string;
  fromState: string; // state.id
  toState: string; // state.id
  label: string;
  description?: string;
  conditions?: WorkflowCondition[];
  actions?: WorkflowAction[];
  requiresApproval?: boolean;
  approvalRoles?: string[];
  automated?: boolean;
  automationTrigger?: 'time' | 'event' | 'condition';
}

export interface WorkflowCondition {
  id: string;
  type: 'field' | 'role' | 'time' | 'custom';
  field?: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'exists';
  value?: any;
  customFunction?: string;
}

export interface WorkflowAction {
  id: string;
  type: 'notification' | 'email' | 'webhook' | 'update_field' | 'create_task' | 'assign_user' | 'custom';
  config: {
    template?: string;
    recipients?: string[];
    field?: string;
    value?: any;
    webhookUrl?: string;
    customFunction?: string;
    [key: string]: any;
  };
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  entityType: WorkflowEntityType;
  version: string;
  isActive: boolean;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  initialState: string; // state.id
  finalStates: string[]; // state.id[]
  settings: {
    allowSkipStates?: boolean;
    requireComments?: boolean;
    trackHistory?: boolean;
    notifyOnTransition?: boolean;
    slaDays?: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ==================== Workflow Instance (Runtime) ====================

export interface WorkflowInstance {
  id: string;
  workflowId: string; // WorkflowDefinition.id
  entityType: WorkflowEntityType;
  entityId: string;
  currentState: string; // state.id
  previousState?: string;
  startedAt: string;
  completedAt?: string;
  assignedTo?: string;
  assignedToName?: string;
  history: WorkflowHistoryEntry[];
  metadata: Record<string, any>;
  slaDeadline?: string;
  isOverdue?: boolean;
}

export interface WorkflowHistoryEntry {
  id: string;
  timestamp: string;
  fromState: string;
  toState: string;
  transitionName: string;
  performedBy: string;
  performedByName: string;
  comments?: string;
  automated: boolean;
  duration?: number; // milliseconds in state
  metadata?: Record<string, any>;
}

// ==================== Workflow Templates (Pre-built) ====================

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  entityType: WorkflowEntityType;
  category: 'recruiting' | 'staffing' | 'finance' | 'hr';
  definition: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
  tags: string[];
  isSystem: boolean;
}

// ==================== Workflow Analytics ====================

export interface WorkflowMetrics {
  workflowId: string;
  totalInstances: number;
  activeInstances: number;
  completedInstances: number;
  averageDuration: number; // hours
  bottleneckStates: Array<{
    stateId: string;
    stateName: string;
    averageTime: number;
    count: number;
  }>;
  transitionCounts: Array<{
    transitionId: string;
    transitionName: string;
    count: number;
  }>;
  slaCompliance: number; // percentage
}

// ==================== Workflow Automation ====================

export interface WorkflowAutomationRule {
  id: string;
  workflowId: string;
  name: string;
  description: string;
  trigger: {
    type: 'state_entered' | 'state_duration' | 'field_changed' | 'time_based';
    stateId?: string;
    field?: string;
    duration?: number; // milliseconds
    schedule?: string; // cron expression
  };
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: string;
}

// ==================== Pre-defined Workflow States ====================

/**
 * Candidate Lifecycle Workflow States
 */
export const CANDIDATE_WORKFLOW_STATES = {
  NEW: { id: 'new', name: 'New', color: '#3b82f6', type: 'initial' as const },
  SCREENING: { id: 'screening', name: 'Screening', color: '#8b5cf6', type: 'intermediate' as const },
  QUALIFIED: { id: 'qualified', name: 'Qualified', color: '#10b981', type: 'intermediate' as const },
  ACTIVE: { id: 'active', name: 'Active', color: '#f59e0b', type: 'intermediate' as const },
  SUBMITTED: { id: 'submitted', name: 'Submitted', color: '#06b6d4', type: 'intermediate' as const },
  INTERVIEWING: { id: 'interviewing', name: 'Interviewing', color: '#6366f1', type: 'intermediate' as const },
  OFFERED: { id: 'offered', name: 'Offered', color: '#8b5cf6', type: 'intermediate' as const },
  PLACED: { id: 'placed', name: 'Placed', color: '#22c55e', type: 'final' as const },
  REJECTED: { id: 'rejected', name: 'Rejected', color: '#ef4444', type: 'final' as const },
  ON_HOLD: { id: 'on_hold', name: 'On Hold', color: '#64748b', type: 'intermediate' as const },
  ARCHIVED: { id: 'archived', name: 'Archived', color: '#94a3b8', type: 'final' as const },
};

/**
 * Job Requisition Workflow States
 */
export const JOB_WORKFLOW_STATES = {
  DRAFT: { id: 'draft', name: 'Draft', color: '#94a3b8', type: 'initial' as const },
  PENDING_APPROVAL: { id: 'pending_approval', name: 'Pending Approval', color: '#f59e0b', type: 'intermediate' as const },
  APPROVED: { id: 'approved', name: 'Approved', color: '#10b981', type: 'intermediate' as const },
  OPEN: { id: 'open', name: 'Open', color: '#3b82f6', type: 'intermediate' as const },
  IN_PROGRESS: { id: 'in_progress', name: 'In Progress', color: '#8b5cf6', type: 'intermediate' as const },
  ON_HOLD: { id: 'on_hold', name: 'On Hold', color: '#64748b', type: 'intermediate' as const },
  FILLED: { id: 'filled', name: 'Filled', color: '#22c55e', type: 'final' as const },
  CLOSED: { id: 'closed', name: 'Closed', color: '#ef4444', type: 'final' as const },
  CANCELLED: { id: 'cancelled', name: 'Cancelled', color: '#94a3b8', type: 'final' as const },
};

/**
 * Submission Workflow States
 */
export const SUBMISSION_WORKFLOW_STATES = {
  SUBMITTED: { id: 'submitted', name: 'Submitted', color: '#3b82f6', type: 'initial' as const },
  REVIEWING: { id: 'reviewing', name: 'Client Review', color: '#8b5cf6', type: 'intermediate' as const },
  SHORTLISTED: { id: 'shortlisted', name: 'Shortlisted', color: '#10b981', type: 'intermediate' as const },
  INTERVIEW_SCHEDULED: { id: 'interview_scheduled', name: 'Interview Scheduled', color: '#06b6d4', type: 'intermediate' as const },
  INTERVIEWED: { id: 'interviewed', name: 'Interviewed', color: '#6366f1', type: 'intermediate' as const },
  OFFERED: { id: 'offered', name: 'Offered', color: '#8b5cf6', type: 'intermediate' as const },
  ACCEPTED: { id: 'accepted', name: 'Accepted', color: '#22c55e', type: 'final' as const },
  REJECTED: { id: 'rejected', name: 'Rejected', color: '#ef4444', type: 'final' as const },
  WITHDRAWN: { id: 'withdrawn', name: 'Withdrawn', color: '#94a3b8', type: 'final' as const },
};

/**
 * Timesheet Workflow States
 */
export const TIMESHEET_WORKFLOW_STATES = {
  DRAFT: { id: 'draft', name: 'Draft', color: '#94a3b8', type: 'initial' as const },
  SUBMITTED: { id: 'submitted', name: 'Submitted', color: '#3b82f6', type: 'intermediate' as const },
  MANAGER_REVIEW: { id: 'manager_review', name: 'Manager Review', color: '#8b5cf6', type: 'intermediate' as const },
  CLIENT_REVIEW: { id: 'client_review', name: 'Client Review', color: '#f59e0b', type: 'intermediate' as const },
  APPROVED: { id: 'approved', name: 'Approved', color: '#10b981', type: 'intermediate' as const },
  INVOICED: { id: 'invoiced', name: 'Invoiced', color: '#06b6d4', type: 'intermediate' as const },
  PAID: { id: 'paid', name: 'Paid', color: '#22c55e', type: 'final' as const },
  REJECTED: { id: 'rejected', name: 'Rejected', color: '#ef4444', type: 'final' as const },
};

/**
 * Invoice Workflow States
 */
export const INVOICE_WORKFLOW_STATES = {
  DRAFT: { id: 'draft', name: 'Draft', color: '#94a3b8', type: 'initial' as const },
  PENDING_APPROVAL: { id: 'pending_approval', name: 'Pending Approval', color: '#f59e0b', type: 'intermediate' as const },
  APPROVED: { id: 'approved', name: 'Approved', color: '#10b981', type: 'intermediate' as const },
  SENT: { id: 'sent', name: 'Sent', color: '#3b82f6', type: 'intermediate' as const },
  VIEWED: { id: 'viewed', name: 'Viewed', color: '#06b6d4', type: 'intermediate' as const },
  PARTIAL_PAID: { id: 'partial_paid', name: 'Partially Paid', color: '#8b5cf6', type: 'intermediate' as const },
  PAID: { id: 'paid', name: 'Paid', color: '#22c55e', type: 'final' as const },
  OVERDUE: { id: 'overdue', name: 'Overdue', color: '#ef4444', type: 'intermediate' as const },
  CANCELLED: { id: 'cancelled', name: 'Cancelled', color: '#94a3b8', type: 'final' as const },
};

/**
 * Placement/Onboarding Workflow States
 */
export const PLACEMENT_WORKFLOW_STATES = {
  OFFER_ACCEPTED: { id: 'offer_accepted', name: 'Offer Accepted', color: '#3b82f6', type: 'initial' as const },
  BACKGROUND_CHECK: { id: 'background_check', name: 'Background Check', color: '#8b5cf6', type: 'intermediate' as const },
  PAPERWORK_PENDING: { id: 'paperwork_pending', name: 'Paperwork Pending', color: '#f59e0b', type: 'intermediate' as const },
  PAPERWORK_COMPLETE: { id: 'paperwork_complete', name: 'Paperwork Complete', color: '#10b981', type: 'intermediate' as const },
  ONBOARDING: { id: 'onboarding', name: 'Onboarding', color: '#06b6d4', type: 'intermediate' as const },
  ACTIVE: { id: 'active', name: 'Active', color: '#22c55e', type: 'final' as const },
  TERMINATED: { id: 'terminated', name: 'Terminated', color: '#ef4444', type: 'final' as const },
};

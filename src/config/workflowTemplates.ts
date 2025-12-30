/**
 * BPM Workflow Templates
 *
 * Pre-built workflow definitions for common recruiting operations
 */

import type { WorkflowTemplate } from '../types/workflow';
import {
  CANDIDATE_WORKFLOW_STATES,
  JOB_WORKFLOW_STATES,
  SUBMISSION_WORKFLOW_STATES,
  TIMESHEET_WORKFLOW_STATES,
  INVOICE_WORKFLOW_STATES,
  PLACEMENT_WORKFLOW_STATES,
} from '../types/workflow';

/**
 * Candidate Lifecycle Workflow
 * Manages candidate from initial screening through placement
 */
export const CANDIDATE_LIFECYCLE_TEMPLATE: WorkflowTemplate = {
  id: 'template_candidate_lifecycle',
  name: 'Candidate Lifecycle',
  description: 'Complete candidate journey from screening to placement',
  entityType: 'candidate',
  category: 'recruiting',
  definition: {
    name: 'Candidate Lifecycle Workflow',
    description: 'Manage candidates through screening, qualification, submission, and placement',
    entityType: 'candidate',
    version: '1.0.0',
    isActive: true,
    states: Object.values(CANDIDATE_WORKFLOW_STATES).map((state, index) => ({
      ...state,
      label: state.name,
      isActive: true,
    })),
    transitions: [
      // NEW -> SCREENING
      {
        id: 'new_to_screening',
        name: 'start_screening',
        fromState: 'new',
        toState: 'screening',
        label: 'Start Screening',
        description: 'Begin candidate screening process',
        actions: [
          {
            id: 'notify_recruiter',
            type: 'notification',
            config: {
              template: 'New candidate assigned for screening',
              recipients: ['assigned_recruiter'],
            },
          },
        ],
      },
      // SCREENING -> QUALIFIED
      {
        id: 'screening_to_qualified',
        name: 'qualify_candidate',
        fromState: 'screening',
        toState: 'qualified',
        label: 'Mark as Qualified',
        description: 'Candidate passed screening',
        conditions: [
          {
            id: 'has_resume',
            type: 'field',
            field: 'resumeUrl',
            operator: 'exists',
          },
        ],
        actions: [
          {
            id: 'add_to_talent_pool',
            type: 'custom',
            config: {
              customFunction: 'addToTalentPool',
            },
          },
        ],
      },
      // SCREENING -> REJECTED
      {
        id: 'screening_to_rejected',
        name: 'reject_candidate',
        fromState: 'screening',
        toState: 'rejected',
        label: 'Reject',
        description: 'Candidate did not pass screening',
        requiresApproval: false,
      },
      // QUALIFIED -> ACTIVE
      {
        id: 'qualified_to_active',
        name: 'activate_candidate',
        fromState: 'qualified',
        toState: 'active',
        label: 'Make Active',
        description: 'Move candidate to active bench',
      },
      // ACTIVE -> SUBMITTED
      {
        id: 'active_to_submitted',
        name: 'submit_to_client',
        fromState: 'active',
        toState: 'submitted',
        label: 'Submit to Client',
        description: 'Submit candidate to client job',
        actions: [
          {
            id: 'create_submission',
            type: 'custom',
            config: {
              customFunction: 'createSubmission',
            },
          },
          {
            id: 'notify_client',
            type: 'email',
            config: {
              template: 'candidate_submission',
              recipients: ['client_contact'],
            },
          },
        ],
      },
      // SUBMITTED -> INTERVIEWING
      {
        id: 'submitted_to_interviewing',
        name: 'schedule_interview',
        fromState: 'submitted',
        toState: 'interviewing',
        label: 'Schedule Interview',
        description: 'Client requested interview',
        actions: [
          {
            id: 'create_interview',
            type: 'custom',
            config: {
              customFunction: 'createInterview',
            },
          },
        ],
      },
      // INTERVIEWING -> OFFERED
      {
        id: 'interviewing_to_offered',
        name: 'extend_offer',
        fromState: 'interviewing',
        toState: 'offered',
        label: 'Extend Offer',
        description: 'Client extended offer',
        actions: [
          {
            id: 'create_offer',
            type: 'custom',
            config: {
              customFunction: 'createOffer',
            },
          },
        ],
      },
      // OFFERED -> PLACED
      {
        id: 'offered_to_placed',
        name: 'accept_offer',
        fromState: 'offered',
        toState: 'placed',
        label: 'Place Candidate',
        description: 'Candidate accepted offer',
        actions: [
          {
            id: 'create_placement',
            type: 'custom',
            config: {
              customFunction: 'createPlacement',
            },
          },
          {
            id: 'notify_success',
            type: 'notification',
            config: {
              template: 'Placement successful!',
              recipients: ['all_team'],
            },
          },
        ],
      },
      // SUBMITTED/INTERVIEWING -> REJECTED
      {
        id: 'client_rejection',
        name: 'client_reject',
        fromState: 'submitted',
        toState: 'rejected',
        label: 'Client Rejected',
        description: 'Client rejected candidate',
      },
      // Any active state -> ON_HOLD
      {
        id: 'put_on_hold',
        name: 'hold_candidate',
        fromState: 'active',
        toState: 'on_hold',
        label: 'Put On Hold',
        description: 'Temporarily pause candidate activities',
      },
    ],
    initialState: 'new',
    finalStates: ['placed', 'rejected', 'archived'],
    settings: {
      allowSkipStates: false,
      requireComments: true,
      trackHistory: true,
      notifyOnTransition: true,
      slaDays: 90,
    },
  },
  tags: ['recruiting', 'candidate', 'lifecycle'],
  isSystem: true,
};

/**
 * Job Requisition Workflow
 * Manages job posting lifecycle
 */
export const JOB_REQUISITION_TEMPLATE: WorkflowTemplate = {
  id: 'template_job_requisition',
  name: 'Job Requisition',
  description: 'Job requisition approval and posting workflow',
  entityType: 'job',
  category: 'recruiting',
  definition: {
    name: 'Job Requisition Workflow',
    description: 'Manage job requisitions from draft to closure',
    entityType: 'job',
    version: '1.0.0',
    isActive: true,
    states: Object.values(JOB_WORKFLOW_STATES).map((state) => ({
      ...state,
      label: state.name,
      isActive: true,
    })),
    transitions: [
      {
        id: 'draft_to_pending',
        name: 'submit_for_approval',
        fromState: 'draft',
        toState: 'pending_approval',
        label: 'Submit for Approval',
        description: 'Submit job requisition for approval',
        conditions: [
          {
            id: 'has_title',
            type: 'field',
            field: 'title',
            operator: 'exists',
          },
          {
            id: 'has_description',
            type: 'field',
            field: 'description',
            operator: 'exists',
          },
        ],
        actions: [
          {
            id: 'notify_approvers',
            type: 'notification',
            config: {
              template: 'New job requisition pending approval',
              recipients: ['hiring_managers'],
            },
          },
        ],
      },
      {
        id: 'pending_to_approved',
        name: 'approve_job',
        fromState: 'pending_approval',
        toState: 'approved',
        label: 'Approve',
        description: 'Approve job requisition',
        requiresApproval: true,
        approvalRoles: ['hiring_manager', 'admin'],
      },
      {
        id: 'approved_to_open',
        name: 'open_job',
        fromState: 'approved',
        toState: 'open',
        label: 'Open Job',
        description: 'Publish job and start sourcing',
        actions: [
          {
            id: 'publish_job',
            type: 'custom',
            config: {
              customFunction: 'publishJob',
            },
          },
        ],
      },
      {
        id: 'open_to_in_progress',
        name: 'start_submissions',
        fromState: 'open',
        toState: 'in_progress',
        label: 'Mark In Progress',
        description: 'First candidate submitted',
        automated: true,
        automationTrigger: 'event',
      },
      {
        id: 'in_progress_to_filled',
        name: 'fill_job',
        fromState: 'in_progress',
        toState: 'filled',
        label: 'Mark as Filled',
        description: 'Job has been filled',
        conditions: [
          {
            id: 'has_placement',
            type: 'field',
            field: 'placementId',
            operator: 'exists',
          },
        ],
      },
    ],
    initialState: 'draft',
    finalStates: ['filled', 'closed', 'cancelled'],
    settings: {
      allowSkipStates: false,
      requireComments: false,
      trackHistory: true,
      notifyOnTransition: true,
      slaDays: 60,
    },
  },
  tags: ['recruiting', 'job', 'requisition'],
  isSystem: true,
};

/**
 * Timesheet Approval Workflow
 * Manages timesheet submission and approval
 */
export const TIMESHEET_APPROVAL_TEMPLATE: WorkflowTemplate = {
  id: 'template_timesheet_approval',
  name: 'Timesheet Approval',
  description: 'Multi-level timesheet approval workflow',
  entityType: 'timesheet',
  category: 'staffing',
  definition: {
    name: 'Timesheet Approval Workflow',
    description: 'Manage timesheet submissions through approval and payment',
    entityType: 'timesheet',
    version: '1.0.0',
    isActive: true,
    states: Object.values(TIMESHEET_WORKFLOW_STATES).map((state) => ({
      ...state,
      label: state.name,
      isActive: true,
    })),
    transitions: [
      {
        id: 'draft_to_submitted',
        name: 'submit_timesheet',
        fromState: 'draft',
        toState: 'submitted',
        label: 'Submit Timesheet',
        description: 'Submit timesheet for approval',
        conditions: [
          {
            id: 'has_hours',
            type: 'field',
            field: 'totalHours',
            operator: 'greater_than',
            value: 0,
          },
        ],
        actions: [
          {
            id: 'notify_manager',
            type: 'notification',
            config: {
              template: 'New timesheet submitted for approval',
              recipients: ['manager'],
            },
          },
        ],
      },
      {
        id: 'submitted_to_manager_review',
        name: 'manager_review',
        fromState: 'submitted',
        toState: 'manager_review',
        label: 'Manager Review',
        description: 'Manager reviewing timesheet',
        automated: true,
        automationTrigger: 'event',
      },
      {
        id: 'manager_to_client',
        name: 'send_to_client',
        fromState: 'manager_review',
        toState: 'client_review',
        label: 'Send to Client',
        description: 'Forward to client for approval',
        requiresApproval: true,
        approvalRoles: ['manager'],
      },
      {
        id: 'client_to_approved',
        name: 'client_approve',
        fromState: 'client_review',
        toState: 'approved',
        label: 'Client Approves',
        description: 'Client approved timesheet',
        requiresApproval: true,
        approvalRoles: ['client'],
        actions: [
          {
            id: 'trigger_invoice',
            type: 'custom',
            config: {
              customFunction: 'generateInvoice',
            },
          },
        ],
      },
      {
        id: 'approved_to_invoiced',
        name: 'create_invoice',
        fromState: 'approved',
        toState: 'invoiced',
        label: 'Generate Invoice',
        description: 'Invoice generated from timesheet',
        automated: true,
        automationTrigger: 'condition',
      },
      {
        id: 'invoiced_to_paid',
        name: 'mark_paid',
        fromState: 'invoiced',
        toState: 'paid',
        label: 'Mark as Paid',
        description: 'Payment received',
      },
      {
        id: 'reject_timesheet',
        name: 'reject',
        fromState: 'manager_review',
        toState: 'rejected',
        label: 'Reject',
        description: 'Reject timesheet',
        requiresApproval: true,
      },
    ],
    initialState: 'draft',
    finalStates: ['paid', 'rejected'],
    settings: {
      allowSkipStates: false,
      requireComments: true,
      trackHistory: true,
      notifyOnTransition: true,
      slaDays: 14,
    },
  },
  tags: ['staffing', 'timesheet', 'approval', 'finance'],
  isSystem: true,
};

/**
 * Invoice Processing Workflow
 * Manages invoice creation through payment
 */
export const INVOICE_PROCESSING_TEMPLATE: WorkflowTemplate = {
  id: 'template_invoice_processing',
  name: 'Invoice Processing',
  description: 'Invoice approval and payment tracking workflow',
  entityType: 'invoice',
  category: 'finance',
  definition: {
    name: 'Invoice Processing Workflow',
    description: 'Manage invoices from creation to payment',
    entityType: 'invoice',
    version: '1.0.0',
    isActive: true,
    states: Object.values(INVOICE_WORKFLOW_STATES).map((state) => ({
      ...state,
      label: state.name,
      isActive: true,
    })),
    transitions: [
      {
        id: 'draft_to_pending',
        name: 'submit_for_approval',
        fromState: 'draft',
        toState: 'pending_approval',
        label: 'Submit for Approval',
        description: 'Submit invoice for approval',
        conditions: [
          {
            id: 'has_line_items',
            type: 'field',
            field: 'lineItems',
            operator: 'exists',
          },
          {
            id: 'has_total',
            type: 'field',
            field: 'totalAmount',
            operator: 'greater_than',
            value: 0,
          },
        ],
      },
      {
        id: 'pending_to_approved',
        name: 'approve_invoice',
        fromState: 'pending_approval',
        toState: 'approved',
        label: 'Approve Invoice',
        description: 'Invoice approved for sending',
        requiresApproval: true,
        approvalRoles: ['finance_manager', 'admin'],
      },
      {
        id: 'approved_to_sent',
        name: 'send_invoice',
        fromState: 'approved',
        toState: 'sent',
        label: 'Send to Client',
        description: 'Send invoice to client',
        actions: [
          {
            id: 'send_email',
            type: 'email',
            config: {
              template: 'invoice_email',
              recipients: ['client_finance'],
            },
          },
        ],
      },
      {
        id: 'sent_to_viewed',
        name: 'mark_viewed',
        fromState: 'sent',
        toState: 'viewed',
        label: 'Mark as Viewed',
        description: 'Client viewed invoice',
        automated: true,
        automationTrigger: 'event',
      },
      {
        id: 'sent_to_paid',
        name: 'mark_paid',
        fromState: 'sent',
        toState: 'paid',
        label: 'Mark as Paid',
        description: 'Payment received',
        conditions: [
          {
            id: 'payment_received',
            type: 'field',
            field: 'amountPaid',
            operator: 'equals',
            value: 'totalAmount',
          },
        ],
      },
      {
        id: 'check_overdue',
        name: 'mark_overdue',
        fromState: 'sent',
        toState: 'overdue',
        label: 'Mark Overdue',
        description: 'Invoice payment overdue',
        automated: true,
        automationTrigger: 'time',
        actions: [
          {
            id: 'send_reminder',
            type: 'email',
            config: {
              template: 'overdue_invoice_reminder',
              recipients: ['client_finance'],
            },
          },
        ],
      },
    ],
    initialState: 'draft',
    finalStates: ['paid', 'cancelled'],
    settings: {
      allowSkipStates: false,
      requireComments: false,
      trackHistory: true,
      notifyOnTransition: true,
      slaDays: 30,
    },
  },
  tags: ['finance', 'invoice', 'billing'],
  isSystem: true,
};

/**
 * All available workflow templates
 */
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  CANDIDATE_LIFECYCLE_TEMPLATE,
  JOB_REQUISITION_TEMPLATE,
  TIMESHEET_APPROVAL_TEMPLATE,
  INVOICE_PROCESSING_TEMPLATE,
];

/**
 * Get template by entity type
 */
export function getTemplatesByEntityType(entityType: string): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter((template) => template.entityType === entityType);
}

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES.find((template) => template.id === templateId);
}

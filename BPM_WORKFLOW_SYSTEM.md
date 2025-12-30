# Business Process Management (BPM) Workflow System

## Overview

A comprehensive, enterprise-grade workflow management system that brings Business Process Management capabilities to the recruiting platform. This system enables automation, state management, and end-to-end process visibility across all recruiting operations.

## Architecture

### Core Components

1. **Workflow Engine** (`src/services/workflow.engine.ts`)
   - State machine implementation
   - Transition validation and execution
   - Condition evaluation
   - Automated action execution
   - Metrics and analytics

2. **Workflow Types** (`src/types/workflow.ts`)
   - Complete type definitions for workflows
   - State and transition models
   - Condition and action types
   - Pre-defined workflow states for all entities

3. **Workflow Templates** (`src/config/workflowTemplates.ts`)
   - Pre-built workflow definitions
   - Production-ready templates for common scenarios
   - Easy customization and deployment

4. **UI Components**
   - `WorkflowVisualization`: Visual workflow state diagram
   - `WorkflowHistory`: Timeline of state transitions
   - `WorkflowManagement`: Central management interface

## Features

### 1. Multi-Entity Workflow Support

Pre-built workflows for:
- **Candidate Lifecycle**: NEW → SCREENING → QUALIFIED → ACTIVE → SUBMITTED → INTERVIEWING → OFFERED → PLACED
- **Job Requisition**: DRAFT → PENDING_APPROVAL → APPROVED → OPEN → IN_PROGRESS → FILLED → CLOSED
- **Submission Process**: SUBMITTED → REVIEWING → SHORTLISTED → INTERVIEW_SCHEDULED → INTERVIEWED → OFFERED → ACCEPTED
- **Timesheet Approval**: DRAFT → SUBMITTED → MANAGER_REVIEW → CLIENT_REVIEW → APPROVED → INVOICED → PAID
- **Invoice Processing**: DRAFT → PENDING_APPROVAL → APPROVED → SENT → VIEWED → PAID
- **Placement/Onboarding**: OFFER_ACCEPTED → BACKGROUND_CHECK → PAPERWORK → ONBOARDING → ACTIVE

### 2. Intelligent Automation

**Automated Transitions:**
- Time-based triggers (e.g., mark invoice overdue after 30 days)
- Event-based triggers (e.g., auto-generate invoice when timesheet approved)
- Condition-based triggers (e.g., move to next state when criteria met)

**Automated Actions:**
- Email notifications
- Webhook calls
- Field updates
- User assignments
- Task creation
- Custom integrations

### 3. Conditional Logic

**Condition Types:**
- Field conditions: equals, not_equals, greater_than, less_than, contains, in, exists
- Role-based conditions: Check user roles/permissions
- Time-based conditions: Duration in state, time since transition
- Custom functions: JavaScript-based custom logic

**Example:**
```typescript
{
  conditions: [
    {
      id: 'has_resume',
      type: 'field',
      field: 'resumeUrl',
      operator: 'exists'
    },
    {
      id: 'min_experience',
      type: 'field',
      field: 'totalExperience',
      operator: 'greater_than',
      value: 3
    }
  ]
}
```

### 4. Approval Workflows

- Multi-level approvals
- Role-based approval routing
- Required approver roles
- Approval history tracking
- Comments requirement enforcement

### 5. SLA Management

- Configure SLA days per workflow
- Auto-calculate deadline dates
- Overdue detection and flagging
- SLA compliance reporting
- Automated reminders for overdue items

### 6. Audit Trail

**Complete History Tracking:**
- Every state transition logged
- Timestamp and user information
- Comments and justifications
- Duration in each state
- Automated vs. manual transitions

**Metrics Captured:**
- Average time in each state
- Bottleneck identification
- Completion rates
- SLA compliance percentage
- Transition frequencies

## Workflow Templates

### 1. Candidate Lifecycle Workflow

**Purpose:** Manage candidates from initial screening through placement

**States:**
- NEW: Candidate just added to system
- SCREENING: Initial screening in progress
- QUALIFIED: Passed screening, ready for roles
- ACTIVE: Actively being marketed
- SUBMITTED: Submitted to client job
- INTERVIEWING: In interview process
- OFFERED: Client extended offer
- PLACED: Successfully placed
- REJECTED: Not selected
- ON_HOLD: Temporarily paused
- ARCHIVED: Moved to archive

**Key Transitions:**
- `start_screening`: NEW → SCREENING
- `qualify_candidate`: SCREENING → QUALIFIED (requires resume)
- `submit_to_client`: ACTIVE → SUBMITTED (creates submission record)
- `schedule_interview`: SUBMITTED → INTERVIEWING (creates interview)
- `extend_offer`: INTERVIEWING → OFFERED (creates offer)
- `accept_offer`: OFFERED → PLACED (creates placement)

**Automation:**
- Auto-notify recruiter when candidate assigned
- Auto-add to talent pool when qualified
- Auto-create submission record
- Team notification on placement

### 2. Job Requisition Workflow

**Purpose:** Job approval and lifecycle management

**States:**
- DRAFT: Being created
- PENDING_APPROVAL: Awaiting approval
- APPROVED: Approved to post
- OPEN: Actively sourcing
- IN_PROGRESS: Has submissions
- ON_HOLD: Temporarily paused
- FILLED: Position filled
- CLOSED: Completed
- CANCELLED: Cancelled before filled

**Key Transitions:**
- `submit_for_approval`: DRAFT → PENDING_APPROVAL (validates required fields)
- `approve_job`: PENDING_APPROVAL → APPROVED (requires approver role)
- `open_job`: APPROVED → OPEN (publishes job)
- `start_submissions`: OPEN → IN_PROGRESS (auto on first submission)
- `fill_job`: IN_PROGRESS → FILLED (requires placement)

**Automation:**
- Notify hiring managers on submission
- Auto-publish approved jobs
- Auto-transition on first submission
- SLA tracking for time-to-fill

### 3. Timesheet Approval Workflow

**Purpose:** Multi-level timesheet approval with auto-invoicing

**States:**
- DRAFT: Being filled out
- SUBMITTED: Employee submitted
- MANAGER_REVIEW: Manager reviewing
- CLIENT_REVIEW: Client reviewing
- APPROVED: Fully approved
- INVOICED: Invoice generated
- PAID: Payment complete
- REJECTED: Rejected by approver

**Key Transitions:**
- `submit_timesheet`: DRAFT → SUBMITTED (validates hours > 0)
- `manager_review`: SUBMITTED → MANAGER_REVIEW (auto-assigned)
- `send_to_client`: MANAGER_REVIEW → CLIENT_REVIEW (requires manager approval)
- `client_approve`: CLIENT_REVIEW → APPROVED (triggers invoice)
- `create_invoice`: APPROVED → INVOICED (automated)
- `mark_paid`: INVOICED → PAID

**Automation:**
- Notify manager on submission
- Auto-generate invoice on approval
- Email client for review
- SLA warnings for pending approvals

### 4. Invoice Processing Workflow

**Purpose:** Invoice creation, approval, and payment tracking

**States:**
- DRAFT: Being created
- PENDING_APPROVAL: Awaiting approval
- APPROVED: Approved to send
- SENT: Sent to client
- VIEWED: Client viewed invoice
- PARTIAL_PAID: Partially paid
- PAID: Fully paid
- OVERDUE: Payment overdue
- CANCELLED: Cancelled

**Key Transitions:**
- `submit_for_approval`: DRAFT → PENDING_APPROVAL (validates line items)
- `approve_invoice`: PENDING_APPROVAL → APPROVED (requires finance role)
- `send_invoice`: APPROVED → SENT (emails client)
- `mark_viewed`: SENT → VIEWED (auto on open)
- `mark_paid`: SENT → PAID (validates payment amount)
- `mark_overdue`: SENT → OVERDUE (auto after 30 days)

**Automation:**
- Email invoice to client
- Track view status
- Auto-mark overdue based on payment terms
- Send payment reminders

## Usage Examples

### 1. Create a Workflow Instance

```typescript
import { workflowEngine } from './services/workflow.engine';
import { CANDIDATE_LIFECYCLE_TEMPLATE } from './config/workflowTemplates';

// Register the workflow
const workflow = {
  ...CANDIDATE_LIFECYCLE_TEMPLATE.definition,
  id: 'candidate_workflow_1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin',
};
workflowEngine.registerWorkflow(workflow);

// Create an instance for a candidate
const instance = workflowEngine.createInstance(
  'candidate_workflow_1',
  'candidate',
  'candidate_123',
  'recruiter_456',
  {
    candidateName: 'John Doe',
    recruiterName: 'Jane Smith',
  }
);

console.log('Workflow started at:', instance.currentState); // 'new'
```

### 2. Execute a Transition

```typescript
// Get available transitions
const available = workflowEngine.getAvailableTransitions(
  instance.id,
  'recruiter_456'
);

console.log('Can transition to:', available.map(t => t.label));
// ['Start Screening', 'Put On Hold', 'Archive']

// Execute transition
const updated = await workflowEngine.executeTransition(
  instance.id,
  'new_to_screening',
  'recruiter_456',
  'Jane Smith',
  'Candidate has strong Java skills'
);

console.log('New state:', updated.currentState); // 'screening'
console.log('History entries:', updated.history.length); // 2
```

### 3. Check Conditions

```typescript
// Workflow will automatically check conditions before allowing transition
// For example, can't qualify candidate without resume:

const canQualify = workflowEngine.canTransitionTo(
  instance.id,
  'qualified',
  'recruiter_456'
);

console.log('Can qualify?', canQualify); // false (no resume uploaded yet)

// Update candidate metadata
instance.metadata.resumeUrl = 'https://example.com/resume.pdf';

// Now can qualify
const canQualifyNow = workflowEngine.canTransitionTo(
  instance.id,
  'qualified',
  'recruiter_456'
);

console.log('Can qualify now?', canQualifyNow); // true
```

### 4. View Workflow History

```tsx
import WorkflowHistory from './components/workflow/WorkflowHistory';

function CandidateWorkflowView({ candidateId }) {
  const instances = workflowEngine.getInstancesByEntity('candidate', candidateId);
  const instance = instances[0];
  const workflow = workflowEngine.getWorkflow(instance.workflowId);

  return (
    <WorkflowHistory
      instance={instance}
      workflow={workflow}
      showTimeDuration={true}
    />
  );
}
```

## Backend Integration

### Required API Endpoints

```typescript
// Workflow Management
GET    /api/workflows                    // List all workflows
POST   /api/workflows                    // Create workflow from template
GET    /api/workflows/:id                // Get workflow definition
PUT    /api/workflows/:id                // Update workflow
DELETE /api/workflows/:id                // Delete workflow

// Workflow Instances
GET    /api/workflow-instances           // List instances (filter by entity)
POST   /api/workflow-instances           // Create new instance
GET    /api/workflow-instances/:id       // Get instance details
POST   /api/workflow-instances/:id/transition  // Execute transition

// Workflow Templates
GET    /api/workflow-templates           // List available templates
GET    /api/workflow-templates/:id       // Get template details
POST   /api/workflow-templates/:id/install  // Install template

// Workflow Analytics
GET    /api/workflows/:id/metrics        // Get workflow metrics
GET    /api/workflows/:id/bottlenecks    // Identify bottlenecks
GET    /api/workflows/:id/sla-compliance // SLA compliance report
```

### Request/Response Examples

**Create Instance:**
```json
POST /api/workflow-instances
{
  "workflowId": "candidate_workflow_1",
  "entityType": "candidate",
  "entityId": "candidate_123",
  "assignedTo": "recruiter_456",
  "metadata": {
    "candidateName": "John Doe",
    "recruiterName": "Jane Smith"
  }
}
```

**Execute Transition:**
```json
POST /api/workflow-instances/instance_123/transition
{
  "transitionId": "new_to_screening",
  "userId": "recruiter_456",
  "userName": "Jane Smith",
  "comments": "Candidate has strong Java skills"
}
```

## Performance Considerations

1. **State Management**: Use Redis or similar for workflow instance storage in production
2. **Event Queue**: Implement message queue (RabbitMQ, Kafka) for async action execution
3. **Caching**: Cache workflow definitions to reduce DB lookups
4. **Indexing**: Index `entityType`, `entityId`, `currentState` for fast queries
5. **Pagination**: Paginate workflow history for entities with many transitions

## Security

1. **Role-Based Access**: Integrate with existing RBAC system
2. **Approval Validation**: Verify approver roles server-side
3. **Audit Logging**: Log all workflow transitions for compliance
4. **Data Privacy**: Respect tenant isolation in multi-tenant setup
5. **API Security**: Require authentication for all workflow endpoints

## Monitoring & Observability

### Key Metrics to Track

1. **Performance Metrics:**
   - Average workflow completion time
   - Time spent in each state
   - Transition success/failure rates
   - Automation execution success rate

2. **Business Metrics:**
   - Workflows completed per day
   - SLA compliance percentage
   - Bottleneck states (high average time)
   - Most common transition paths

3. **System Metrics:**
   - Workflow engine throughput
   - Action execution latency
   - Condition evaluation performance
   - Instance storage size

## Future Enhancements

1. **Visual Workflow Designer**: Drag-and-drop workflow creation UI
2. **Advanced Routing**: Parallel transitions, merge states, conditional routing
3. **Workflow Versioning**: Version control with migration support
4. **Rollback Support**: Ability to undo transitions
5. **External Integrations**: Native Salesforce, Slack, Teams connectors
6. **Machine Learning**: AI-powered bottleneck prediction
7. **Workflow Marketplace**: Community-contributed workflow templates
8. **Mobile App**: Native workflow execution on mobile devices

## Migration Guide

### From Current Status Fields to Workflows

**Before:**
```typescript
candidate.status = 'SUBMITTED';
await candidateService.update(candidateId, { status: 'SUBMITTED' });
```

**After:**
```typescript
const instance = workflowEngine.getInstancesByEntity('candidate', candidateId)[0];
await workflowEngine.executeTransition(
  instance.id,
  'active_to_submitted',
  userId,
  userName,
  'Submitted to Acme Corp for Sr. Java role'
);
```

### Benefits of Migration

1. **Audit Trail**: Every status change now has complete history
2. **Validation**: Can't make invalid state transitions
3. **Automation**: Automatic actions on state change
4. **Visibility**: Clear view of where each entity is in the process
5. **Metrics**: Built-in analytics and bottleneck detection

## License

Internal use only - Part of the recruiting platform

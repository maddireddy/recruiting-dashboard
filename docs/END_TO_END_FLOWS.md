# End-to-End Flow Documentation

## Overview

This document describes the complete end-to-end workflows for all major use cases in the recruiting platform. Each flow shows the journey from start to finish, including user interactions, system actions, workflow transitions, and integrations.

---

## Table of Contents

1. [Candidate Placement Flow](#1-candidate-placement-flow)
2. [Job Fulfillment Flow](#2-job-fulfillment-flow)
3. [Contractor Staffing Flow](#3-contractor-staffing-flow)
4. [Timesheet to Payment Flow](#4-timesheet-to-payment-flow)
5. [Invoice Management Flow](#5-invoice-management-flow)
6. [Interview Scheduling Flow](#6-interview-scheduling-flow)
7. [Offer Management Flow](#7-offer-management-flow)
8. [Multi-Tenant Onboarding Flow](#8-multi-tenant-onboarding-flow)

---

## 1. Candidate Placement Flow

### Complete Journey: Sourcing → Screening → Submission → Interview → Offer → Placement

#### Phase 1: Candidate Sourcing & Screening (Days 1-3)

**User Actions:**
1. Recruiter navigates to **Candidates** page
2. Clicks **"Add Candidate"** button
3. Fills candidate form:
   - Basic info (name, email, phone)
   - Skills (Java, Spring Boot, AWS)
   - Experience (7 years)
   - Visa status (H1B)
   - Resume upload
4. Clicks **"Save Candidate"**

**System Actions:**
1. Validates required fields
2. Uploads resume to cloud storage
3. Creates candidate record in database
4. **Workflow**: Creates workflow instance
   - State: `NEW`
   - Assigned to: Current recruiter
   - SLA: 90 days
5. Triggers AI Resume Parser (if Pro/Enterprise)
6. Sends notification: "New candidate assigned"

**API Calls:**
```
POST /api/candidates
GET /api/ai/parse-resume (if enabled)
POST /api/workflow-instances
```

**Workflow State:** `NEW`

---

#### Phase 2: Candidate Screening (Days 1-3)

**User Actions:**
1. Recruiter clicks **"Start Screening"** on candidate card
2. Reviews resume and conducts phone screen
3. Updates candidate notes
4. Clicks **"Mark as Qualified"**

**System Actions:**
1. **Workflow**: Execute transition `new_to_screening`
   - State: `NEW` → `SCREENING`
   - History logged with timestamp
2. Validates screening completion
3. **Workflow**: Execute transition `screening_to_qualified`
   - Condition check: `resumeUrl` exists ✓
   - State: `SCREENING` → `QUALIFIED`
   - Action: Add to relevant talent pools
4. Updates searchable index

**API Calls:**
```
POST /api/workflow-instances/{id}/transition
PUT /api/candidates/{id}
POST /api/talent-pools/{poolId}/members
```

**Workflow State:** `QUALIFIED`

---

#### Phase 3: Job Matching & Submission (Days 4-7)

**User Actions:**
1. Recruiter navigates to **Jobs** page
2. Searches for "Java Developer" jobs
3. Selects "Senior Java Developer - Acme Corp"
4. On job details page, clicks **"Submit Candidates"**
5. Selects qualified candidate from list
6. Sets proposed rate: $75/hour
7. Adds submission notes
8. Clicks **"Submit to Client"**

**System Actions:**
1. **Workflow**: Execute transition `qualified_to_active`
   - State: `QUALIFIED` → `ACTIVE`
2. Creates submission record
3. **Workflow**: Execute transition `active_to_submitted`
   - State: `ACTIVE` → `SUBMITTED`
   - Action: Create submission record
   - Action: Email client contact
4. Sends email to client:
   ```
   Subject: New Candidate Submitted - Senior Java Developer
   Body: [Candidate profile summary]
   ```
5. Creates activity log entry

**API Calls:**
```
POST /api/submissions
POST /api/workflow-instances/{id}/transition
POST /api/emails/send
PUT /api/jobs/{id}/submissions-count
```

**Workflow State:** `SUBMITTED`
**Submission Status:** `SUBMITTED`

---

#### Phase 4: Client Review & Interview (Days 8-15)

**User Actions:**
1. Client reviews submission in portal
2. Client clicks **"Schedule Interview"**
3. Selects interview panel members
4. Chooses interview date/time
5. Sends calendar invites

**System Actions:**
1. Updates submission status
2. **Workflow**: Execute transition `submitted_to_interviewing`
   - State: `SUBMITTED` → `INTERVIEWING`
   - Action: Create interview record
   - Action: Send calendar invites
3. Creates interview scorecard templates
4. Sends reminder notifications (24 hours before)

**API Calls:**
```
POST /api/interviews
POST /api/workflow-instances/{id}/transition
POST /api/submissions/{id}
POST /api/emails/calendar-invite
```

**Workflow State:** `INTERVIEWING`
**Submission Status:** `INTERVIEW_SCHEDULED` → `INTERVIEWED`

---

#### Phase 5: Offer & Acceptance (Days 16-20)

**User Actions:**
1. Client completes interview feedback
2. Hiring manager navigates to **Offers** page
3. Clicks **"Create Offer"**
4. Fills offer details:
   - Job title, start date
   - Compensation: $75/hour
   - Benefits, vacation days
5. Clicks **"Send Offer"**

**System Actions:**
1. **Workflow**: Execute transition `interviewing_to_offered`
   - State: `INTERVIEWING` → `OFFERED`
   - Action: Create offer record
2. Generates offer letter PDF
3. Sends offer email to candidate
4. Creates e-signature workflow (DocuSign/Adobe Sign)

**API Calls:**
```
POST /api/offers
POST /api/workflow-instances/{id}/transition
POST /api/documents/generate-pdf
POST /api/emails/send
POST /api/integrations/docusign/create-envelope
```

**Workflow State:** `OFFERED`
**Offer Status:** `SENT`

---

#### Phase 6: Placement & Onboarding (Days 21-25)

**User Actions:**
1. Candidate signs offer letter electronically
2. Recruiter receives notification
3. Recruiter clicks **"Mark as Placed"**
4. System prompts for placement details:
   - Start date
   - End date (if contract)
   - Client contact
5. Clicks **"Create Placement"**

**System Actions:**
1. **Workflow**: Execute transition `offered_to_placed`
   - State: `OFFERED` → `PLACED`
   - Action: Create placement record
   - Action: Notify team (celebration!)
   - Completion: Workflow ended (final state)
2. Creates onboarding checklist:
   - Background check
   - I9 verification
   - W4 forms
   - Benefits enrollment
   - Equipment provisioning
3. Updates job opening count
4. Triggers contractor timesheet setup

**API Calls:**
```
POST /api/placements
POST /api/workflow-instances/{id}/transition
POST /api/onboarding/checklists
POST /api/jobs/{id}
POST /api/notifications/team
```

**Workflow State:** `PLACED` (Final State)
**Duration:** ~25 days (within SLA)

---

## 2. Job Fulfillment Flow

### Complete Journey: Job Creation → Approval → Sourcing → Filling

#### Phase 1: Job Requisition Creation

**User Actions:**
1. Hiring Manager logs in
2. Navigates to **Jobs** → **"Create Job"**
3. Fills job requisition form:
   - Title: "Senior Java Developer"
   - Client: "Acme Corporation"
   - Location: "New York, NY"
   - Job Type: CONTRACT
   - Required Skills: Java, Spring Boot, Microservices
   - Min/Max Experience: 5-8 years
   - Rate Range: $70-80/hour
   - Job Description (uses AI JD Generator)
   - Number of openings: 2
4. Clicks **"Save as Draft"**

**System Actions:**
1. Validates required fields
2. Saves to database
3. **Workflow**: Creates job workflow instance
   - State: `DRAFT`
   - Assigned to: Hiring Manager
4. Auto-saves every 30 seconds

**API Calls:**
```
POST /api/jobs (status: draft)
POST /api/workflow-instances
```

**Workflow State:** `DRAFT`

---

#### Phase 2: Approval Workflow

**User Actions:**
1. Hiring Manager reviews draft
2. Clicks **"Submit for Approval"**
3. System validates all required fields
4. Approval routed to Finance Manager

**System Actions:**
1. **Workflow**: Execute transition `draft_to_pending`
   - Condition check: Has title ✓
   - Condition check: Has description ✓
   - State: `DRAFT` → `PENDING_APPROVAL`
   - Action: Notify approvers
2. Creates approval task
3. Sends email to Finance Manager
4. Adds to their approval queue

**API Calls:**
```
POST /api/workflow-instances/{id}/transition
POST /api/approvals
POST /api/emails/send
```

**Workflow State:** `PENDING_APPROVAL`

---

#### Phase 3: Job Approval & Publishing

**User Actions:**
1. Finance Manager reviews budget
2. Navigates to **Approvals** page
3. Reviews job requisition details
4. Clicks **"Approve"**
5. System auto-transitions to APPROVED
6. Recruiter clicks **"Open Job"** to start sourcing

**System Actions:**
1. **Workflow**: Execute transition `pending_to_approved`
   - Requires: finance_manager role ✓
   - State: `PENDING_APPROVAL` → `APPROVED`
2. Notifies Hiring Manager of approval
3. **Workflow**: Execute transition `approved_to_open`
   - State: `APPROVED` → `OPEN`
   - Action: Publish to job boards
   - Action: Create sourcing pipeline
4. Posts to configured job boards (LinkedIn, Indeed)
5. Creates career page listing

**API Calls:**
```
POST /api/workflow-instances/{id}/transition (approve)
POST /api/workflow-instances/{id}/transition (open)
POST /api/integrations/job-boards/post
POST /api/career-page/jobs
```

**Workflow State:** `OPEN`

---

#### Phase 4: Active Sourcing

**User Actions:**
1. Recruiters search talent pools
2. Use AI-powered semantic search
3. Identify 5 qualified candidates
4. Submit candidates to job (see Candidate Flow)

**System Actions:**
1. **Workflow**: Auto-transition on first submission
   - Event trigger: First submission created
   - State: `OPEN` → `IN_PROGRESS`
2. Updates job metrics
3. Sends daily digest to Hiring Manager

**API Calls:**
```
POST /api/submissions (multiple)
POST /api/workflow-instances/{id}/transition (auto)
GET /api/analytics/job-pipeline
```

**Workflow State:** `IN_PROGRESS`

---

#### Phase 5: Position Filled

**User Actions:**
1. Candidate accepts offer (see Candidate Flow Phase 6)
2. Recruiter navigates to job details
3. Clicks **"Mark as Filled"**
4. Selects placement that filled the role

**System Actions:**
1. **Workflow**: Execute transition `in_progress_to_filled`
   - Condition check: Has placement ✓
   - State: `IN_PROGRESS` → `FILLED`
   - Completion: Workflow ended (final state)
2. Decrements openings count (2 → 1)
3. If all openings filled:
   - Updates job status to CLOSED
   - Removes from job boards
   - Archives in career page
4. Calculates time-to-fill metric
5. Sends success notification to team

**API Calls:**
```
POST /api/workflow-instances/{id}/transition
PUT /api/jobs/{id}
POST /api/integrations/job-boards/remove
POST /api/notifications/team
```

**Workflow State:** `FILLED` (Final State)
**Time-to-Fill:** ~30 days

---

## 3. Contractor Staffing Flow

### Complete Journey: Placement → Onboarding → Active Work → Offboarding

#### Phase 1: Placement Confirmation (Day 0)

**Prerequisites:**
- Candidate accepted offer
- **Workflow State:** `PLACED`

**User Actions:**
1. Account Manager navigates to **Placements**
2. Reviews new placement
3. Clicks **"Start Onboarding"**

**System Actions:**
1. Creates onboarding workflow instance
2. Generates onboarding checklist:
   - [ ] Background check initiated
   - [ ] I9 verification
   - [ ] Tax forms (W4, State withholding)
   - [ ] Direct deposit setup
   - [ ] Equipment request
   - [ ] System access requests
   - [ ] Client orientation scheduled
3. Sends welcome email to contractor
4. Assigns onboarding coordinator

**API Calls:**
```
POST /api/onboarding/workflows
POST /api/onboarding/checklists
POST /api/emails/welcome
```

---

#### Phase 2: Onboarding Tasks (Days 1-5)

**User Actions:**
1. Contractor completes online forms
2. Uploads required documents
3. Completes compliance training
4. Onboarding Coordinator reviews

**System Actions:**
1. Validates document uploads
2. Runs background check (Checkr integration)
3. Creates employee record in payroll system
4. Provisions laptop and equipment
5. Creates email account and system access
6. Schedules client orientation
7. Updates onboarding progress: 85% complete

**API Calls:**
```
POST /api/documents/upload
POST /api/integrations/checkr/initiate
POST /api/integrations/payroll/create-employee
POST /api/integrations/it/provision
```

---

#### Phase 3: Active Placement (Weeks 1-52)

**User Actions:**
1. Contractor starts working on Monday
2. Account Manager marks onboarding complete
3. Creates timesheet workflow instance
4. Contractor logs hours weekly

**System Actions:**
1. **Onboarding Workflow**: `ACTIVE` (final state)
2. **Timesheet Workflow**: Creates instance
   - State: `DRAFT`
   - Frequency: Weekly
   - Due: Every Friday
3. Sets up recurring reminders
4. Monitors placement status

**API Calls:**
```
POST /api/onboarding/complete
POST /api/timesheets/setup-recurring
POST /api/placements/{id}/activate
```

---

## 4. Timesheet to Payment Flow

### Complete Journey: Hours Logged → Approval → Invoice → Payment

#### Phase 1: Weekly Timesheet Entry (Every Week)

**User Actions:**
1. Contractor logs in on Friday
2. Navigates to **Contractor Timesheets**
3. Sees current week timesheet (auto-created)
4. Fills in daily hours:
   - Monday: 8 hours
   - Tuesday: 8 hours
   - Wednesday: 9 hours (1 hour OT)
   - Thursday: 8 hours
   - Friday: 8 hours
   - Total: 41 hours (40 regular + 1 OT)
5. Adds work descriptions per day
6. Clicks **"Submit Timesheet"**

**System Actions:**
1. **Workflow**: Execute transition `draft_to_submitted`
   - Condition check: totalHours > 0 ✓
   - State: `DRAFT` → `SUBMITTED`
   - Action: Notify account manager
2. Calculates totals:
   - Regular hours: 40 × $75/hr = $3,000
   - Overtime: 1 × $112.50/hr = $112.50
   - Total: $3,112.50
3. Sends notification to Account Manager
4. Creates activity log

**API Calls:**
```
PUT /api/contractor-timesheets/{id}
POST /api/workflow-instances/{id}/transition
POST /api/notifications
```

**Workflow State:** `SUBMITTED`

---

#### Phase 2: Manager Review (Monday)

**User Actions:**
1. Account Manager receives notification
2. Navigates to **Timesheets** → **Pending Review**
3. Reviews timesheet details
4. Verifies hours against project tracking
5. Clicks **"Approve & Send to Client"**

**System Actions:**
1. **Workflow**: Auto-transition `submitted_to_manager_review`
   - State: `SUBMITTED` → `MANAGER_REVIEW`
2. **Workflow**: Execute transition `manager_to_client`
   - Requires: manager role ✓
   - State: `MANAGER_REVIEW` → `CLIENT_REVIEW`
   - Action: Email client for approval
3. Sends email to client contact
4. Updates timesheet status

**API Calls:**
```
POST /api/workflow-instances/{id}/transition (auto)
POST /api/workflow-instances/{id}/transition (manager approval)
POST /api/emails/send
```

**Workflow State:** `CLIENT_REVIEW`

---

#### Phase 3: Client Approval (Tuesday-Wednesday)

**User Actions:**
1. Client receives email notification
2. Clicks link to review timesheet
3. Verifies work performed
4. Clicks **"Approve Timesheet"**

**System Actions:**
1. **Workflow**: Execute transition `client_to_approved`
   - Requires: client role ✓
   - State: `CLIENT_REVIEW` → `APPROVED`
   - Action: Trigger invoice generation
2. Creates invoice from timesheet:
   - Invoice #: INV-2025-001
   - Line items from timesheet entries
   - Subtotal: $3,112.50
   - Tax (if applicable): $0
   - Total: $3,112.50
   - Payment terms: Net 30
   - Due date: 30 days from now
3. Links timesheet to invoice
4. **Workflow**: Auto-transition `approved_to_invoiced`
   - State: `APPROVED` → `INVOICED`

**API Calls:**
```
POST /api/workflow-instances/{id}/transition
POST /api/invoices/generate-from-timesheet
POST /api/workflow-instances/{invoiceWorkflowId}/create
```

**Workflow State:** `INVOICED`

---

## 5. Invoice Management Flow

### Complete Journey: Generation → Approval → Sending → Payment

#### Phase 1: Auto-Generation from Timesheet

**System Actions (from Timesheet Flow):**
1. Invoice auto-created when timesheet approved
2. **Workflow**: Invoice workflow instance created
   - State: `DRAFT`
   - Type: CLIENT_BILLING
3. Pre-fills all details from timesheet
4. Assigns to Finance Manager for review

**API Calls:**
```
POST /api/invoices
POST /api/workflow-instances (invoice workflow)
```

**Workflow State:** `DRAFT`

---

#### Phase 2: Finance Review (Thursday)

**User Actions:**
1. Finance Manager navigates to **Invoices** → **Pending Approval**
2. Reviews invoice details
3. Verifies calculations
4. Adds payment instructions
5. Clicks **"Approve Invoice"**

**System Actions:**
1. **Workflow**: Execute transition `draft_to_pending`
   - State: `DRAFT` → `PENDING_APPROVAL`
2. **Workflow**: Execute transition `pending_to_approved`
   - Condition check: has line items ✓
   - Condition check: totalAmount > 0 ✓
   - Requires: finance_manager role ✓
   - State: `PENDING_APPROVAL` → `APPROVED`
3. Generates invoice PDF
4. Ready to send to client

**API Calls:**
```
POST /api/workflow-instances/{id}/transition (pending)
POST /api/workflow-instances/{id}/transition (approved)
POST /api/documents/generate-pdf
```

**Workflow State:** `APPROVED`

---

#### Phase 3: Invoice Delivery (Friday)

**User Actions:**
1. Finance Manager clicks **"Send to Client"**
2. Reviews email template
3. Attaches invoice PDF
4. Clicks **"Send Invoice"**

**System Actions:**
1. **Workflow**: Execute transition `approved_to_sent`
   - State: `APPROVED` → `SENT`
   - Action: Email client with attachment
2. Sends professional invoice email:
   ```
   Subject: Invoice INV-2025-001 - Week of Jan 20
   Attachments: INV-2025-001.pdf
   Body: [Payment instructions, due date, line items summary]
   ```
3. Tracks email open (pixel tracking)
4. Sets payment deadline: 30 days
5. Creates payment reminder schedule

**API Calls:**
```
POST /api/workflow-instances/{id}/transition
POST /api/emails/send-with-attachment
POST /api/invoices/{id}/track
```

**Workflow State:** `SENT`

---

#### Phase 4: Client Views Invoice

**System Actions (Automated):**
1. Client opens email
2. Email tracking pixel fires
3. **Workflow**: Auto-transition `sent_to_viewed`
   - Event trigger: Email opened
   - State: `SENT` → `VIEWED`
4. Notifies Account Manager: "Client viewed invoice"

**API Calls:**
```
POST /api/invoices/{id}/track-open
POST /api/workflow-instances/{id}/transition (auto)
POST /api/notifications
```

**Workflow State:** `VIEWED`

---

#### Phase 5: Payment Receipt (Day 25)

**User Actions:**
1. Finance Manager receives bank deposit notification
2. Navigates to **Invoices** → **Outstanding**
3. Finds invoice INV-2025-001
4. Clicks **"Record Payment"**
5. Enters:
   - Payment amount: $3,112.50
   - Payment method: ACH
   - Transaction ID: ACH123456
   - Payment date: Today
6. Clicks **"Mark as Paid"**

**System Actions:**
1. **Workflow**: Execute transition `sent_to_paid`
   - Condition check: amountPaid === totalAmount ✓
   - State: `SENT` → `PAID`
   - Completion: Workflow ended (final state)
2. **Timesheet Workflow**: Execute transition `invoiced_to_paid`
   - State: `INVOICED` → `PAID`
   - Completion: Workflow ended (final state)
3. Updates financial reports
4. Triggers contractor payment processing
5. Archives invoice

**API Calls:**
```
POST /api/invoices/{id}/record-payment
POST /api/workflow-instances/{invoiceWorkflowId}/transition
POST /api/workflow-instances/{timesheetWorkflowId}/transition
POST /api/reports/update-financials
```

**Workflow State:** `PAID` (Final State)
**Payment Received:** Within SLA (30 days)

---

## 6. Interview Scheduling Flow

### Complete Journey: Scheduling → Preparation → Interview → Feedback

#### Phase 1: Interview Request

**User Actions:**
1. Hiring Manager reviews candidate submission
2. Clicks **"Schedule Interview"** on submission
3. Fills interview details:
   - Interview type: Technical Round
   - Duration: 60 minutes
   - Panel members: 3 interviewers
   - Preferred dates: Next week
4. Clicks **"Create Interview"**

**System Actions:**
1. Creates interview record
2. Checks interviewer availability (calendar integration)
3. Suggests 3 time slots based on availability
4. Sends scheduling link to candidate
5. Creates interview scorecard templates
6. Generates interview guide from job description

**API Calls:**
```
POST /api/interviews
POST /api/integrations/calendar/check-availability
POST /api/scorecards/generate-template
POST /api/interview-guides/generate
```

---

#### Phase 2: Time Selection & Confirmation

**User Actions:**
1. Candidate receives email with scheduling link
2. Clicks link to view available slots
3. Selects preferred time slot
4. Confirms interview details

**System Actions:**
1. Books selected time slot
2. Creates calendar events for all participants
3. Sends calendar invites (Outlook/Google Calendar)
4. Sends confirmation emails to:
   - Candidate
   - All interviewers
   - Recruiting team
5. Creates Zoom/Teams meeting link
6. Sets up reminder notifications

**API Calls:**
```
POST /api/interviews/{id}/confirm-slot
POST /api/integrations/calendar/create-events
POST /api/integrations/zoom/create-meeting
POST /api/emails/send-bulk
```

---

#### Phase 3: Interview Preparation (24 hours before)

**System Actions (Automated):**
1. Sends reminder notifications
2. Emails interview packet to panel:
   - Candidate resume
   - Interview guide
   - Scorecard link
   - Job description
   - Previous interview feedback (if any)
3. Sends candidate reminder with:
   - Meeting link
   - Interview format
   - Panel member profiles
   - Preparation tips

**API Calls:**
```
POST /api/notifications/reminder (scheduled)
POST /api/emails/interview-prep
POST /api/documents/generate-packet
```

---

#### Phase 4: Interview Execution

**During Interview:**
1. Participants join Zoom/Teams meeting
2. Interview Intelligence records conversation (if enabled)
3. Real-time transcription (if enabled)
4. AI captures key moments

**System Actions:**
1. Tracks meeting attendance
2. Records interview (with consent)
3. Generates real-time transcript
4. Detects technical questions asked
5. Flags potential concerns

**API Calls:**
```
POST /api/interview-recordings/start
POST /api/integrations/zoom/get-transcript
POST /api/ai/interview-intelligence/analyze
```

---

#### Phase 5: Feedback Collection

**User Actions:**
1. After interview, each panel member receives scorecard link
2. Each interviewer fills scorecard:
   - Technical skills: 4/5
   - Communication: 5/5
   - Culture fit: 4/5
   - Overall recommendation: STRONG_YES
3. Adds detailed comments
4. Submits scorecard

**System Actions:**
1. Collects all scorecards
2. Calculates aggregate scores
3. Generates hiring recommendation
4. AI analyzes transcript for:
   - Answer quality
   - Technical depth
   - Red flags
5. Compiles comprehensive interview report
6. Notifies Hiring Manager when all scorecards submitted

**API Calls:**
```
POST /api/scorecards/{id}/submit
GET /api/interviews/{id}/aggregate-scores
POST /api/ai/interview-intelligence/generate-report
POST /api/notifications
```

---

## 7. Offer Management Flow

### Complete Journey: Offer Creation → Approval → Negotiation → Acceptance

#### Phase 1: Offer Preparation

**User Actions:**
1. Hiring Manager navigates to **Offers** → **"Create Offer"**
2. Selects candidate and job
3. Fills offer details:
   - Job title: "Senior Java Developer"
   - Start date: Feb 15, 2025
   - Compensation:
     - Hourly rate: $75/hour (or annual salary)
     - Bill rate: $95/hour (if contract)
     - Overtime rate: 1.5x
   - Benefits:
     - Health insurance
     - 401k matching
     - 15 vacation days
   - Contract duration: 12 months (if contract)
   - Reporting structure
4. Uses AI to generate offer letter
5. Reviews generated letter
6. Clicks **"Submit for Approval"** (if required)

**System Actions:**
1. Validates offer details
2. Checks against budget approval
3. AI generates professional offer letter PDF
4. Routes to appropriate approver based on:
   - Compensation level
   - Job level
   - Client requirements
5. Creates approval workflow

**API Calls:**
```
POST /api/offers
POST /api/ai/generate-offer-letter
POST /api/approvals/create
POST /api/documents/generate-pdf
```

---

#### Phase 2: Offer Approval (if required)

**User Actions:**
1. VP/Finance reviews offer in approval queue
2. Checks compensation alignment
3. Reviews offer letter
4. Clicks **"Approve Offer"**

**System Actions:**
1. Marks offer as approved
2. Notifies Hiring Manager
3. Enables "Send Offer" button
4. Updates offer status

**API Calls:**
```
POST /api/approvals/{id}/approve
POST /api/offers/{id}/approve
POST /api/notifications
```

---

#### Phase 3: Offer Delivery

**User Actions:**
1. Recruiter clicks **"Send Offer"**
2. Reviews email template
3. Selects delivery method:
   - Email with PDF
   - E-signature (DocuSign/Adobe Sign)
4. Clicks **"Send to Candidate"**

**System Actions:**
1. Generates final offer letter PDF
2. Creates e-signature envelope (if selected):
   - Upload document
   - Set signing order
   - Add signature fields
   - Set expiration (7 days)
3. Sends email to candidate:
   ```
   Subject: Offer Letter - Senior Java Developer at Acme Corp
   Body: Congratulations! Please review and sign...
   Attachment: Offer_Letter_John_Doe.pdf
   Link: [Sign Document]
   ```
4. Sets offer expiration reminder
5. Updates offer status: SENT

**API Calls:**
```
POST /api/offers/{id}/send
POST /api/integrations/docusign/create-envelope
POST /api/emails/send-offer
POST /api/documents/finalize-pdf
```

---

#### Phase 4: Offer Negotiation (if applicable)

**User Actions:**
1. Candidate clicks **"Request Changes"** in email
2. Fills negotiation form:
   - Requested rate: $80/hour
   - Reason: Market rate for experience
3. Submits request

**System Actions:**
1. Creates negotiation thread
2. Notifies Hiring Manager
3. Tracks negotiation history
4. Allows counter-offers

**User Actions (Hiring Manager):**
1. Reviews negotiation request
2. Consults with Finance
3. Creates counter-offer: $77/hour
4. Sends updated offer

**System Actions:**
1. Revokes original e-signature envelope
2. Generates new offer letter
3. Creates new envelope
4. Sends updated offer
5. Tracks negotiation rounds

**API Calls:**
```
POST /api/offers/{id}/negotiate
POST /api/integrations/docusign/void-envelope
POST /api/offers/{id}/counter-offer
POST /api/documents/generate-pdf
POST /api/integrations/docusign/create-envelope
```

---

#### Phase 5: Offer Acceptance

**User Actions:**
1. Candidate reviews final offer
2. Clicks **"Sign Document"** in DocuSign email
3. Reviews offer terms
4. Signs electronically
5. Submits signed document

**System Actions:**
1. DocuSign webhook triggers
2. Downloads signed document
3. Stores in document repository
4. Updates offer status: ACCEPTED
5. Triggers next steps:
   - Creates placement record
   - Initiates onboarding workflow
   - Updates candidate workflow: `OFFERED` → `PLACED`
   - Updates job openings count
   - Notifies team of success
6. Sends welcome email to new hire
7. Archives offer in document management

**API Calls:**
```
POST /api/webhooks/docusign (incoming)
GET /api/integrations/docusign/get-document
POST /api/documents/store
PUT /api/offers/{id}/accept
POST /api/placements/create
POST /api/workflow-instances/{candidateWorkflowId}/transition
POST /api/onboarding/initiate
POST /api/notifications/team
POST /api/emails/welcome
```

---

## 8. Multi-Tenant Onboarding Flow

### Complete Journey: Sign-up → Configuration → Team Setup → Go-Live

#### Phase 1: Organization Sign-up

**User Actions:**
1. Visitor navigates to signup page
2. Fills registration form:
   - Company name: "TechStaff Inc"
   - Subdomain: "techstaff" (validates uniqueness)
   - Admin email: admin@techstaff.com
   - Admin name: "Jane Smith"
   - Industry: "IT Staffing"
   - Company size: "50-200 employees"
   - Phone number
3. Selects plan tier: Pro ($299/month)
4. Enters payment details
5. Clicks **"Start Free Trial"** (14 days)

**System Actions:**
1. Validates subdomain availability
2. Creates organization record:
   - ID: org_techstaff_123
   - Subdomain: techstaff
   - Status: trial
   - Plan: pro
   - Trial ends: 14 days from now
3. Creates admin user account
4. Sets up database schema/namespace
5. Creates Stripe customer
6. Sets up trial subscription
7. Generates API keys
8. Sends verification email
9. Redirects to: techstaff.recruiting-platform.com

**API Calls:**
```
POST /api/auth/register
POST /api/organizations
POST /api/tenants/provision
POST /api/integrations/stripe/create-customer
POST /api/integrations/stripe/create-trial
POST /api/users/create-admin
POST /api/emails/verify-account
```

---

#### Phase 2: Workspace Configuration

**User Actions:**
1. Admin logs in to techstaff.recruiting-platform.com
2. Completes onboarding wizard:

**Step 1: Branding**
- Upload company logo
- Set primary brand color: #2563eb
- Upload email header image
- Configure email signature

**Step 2: Settings**
- Time zone: America/New_York
- Date format: MM/DD/YYYY
- Currency: USD
- Work week: Mon-Fri
- Business hours: 9 AM - 5 PM

**Step 3: Email Configuration**
- Connect email (Gmail/Outlook)
- Set up SMTP relay
- Configure email templates
- Test email sending

**Step 4: Integrations** (optional)
- Connect job boards (LinkedIn, Indeed)
- Connect calendar (Google Calendar)
- Connect e-signature (DocuSign)
- Connect video (Zoom)

**System Actions:**
1. Stores organization preferences
2. Uploads assets to CDN
3. Validates email connection
4. Tests integrations
5. Updates organization config
6. Applies white-label branding

**API Calls:**
```
PUT /api/organizations/{id}
POST /api/organizations/{id}/branding
POST /api/integrations/email/connect
POST /api/integrations/job-boards/connect
POST /api/integrations/calendar/authorize
```

---

#### Phase 3: Team Invitation

**User Actions:**
1. Admin navigates to **Settings** → **Team**
2. Clicks **"Invite Team Members"**
3. Adds team members:
   - john@techstaff.com (Recruiter)
   - sarah@techstaff.com (Account Manager)
   - mike@techstaff.com (Sales)
4. Sets roles and permissions
5. Clicks **"Send Invitations"**

**System Actions:**
1. Creates user records (pending status)
2. Generates invitation tokens
3. Sends invitation emails:
   ```
   Subject: You've been invited to join TechStaff Inc
   Body: Jane Smith invited you to join...
   Link: https://techstaff.recruiting-platform.com/accept-invite?token=xyz
   ```
4. Tracks invitation status

**API Calls:**
```
POST /api/users/invite-bulk
POST /api/emails/send-invitations
```

---

#### Phase 4: Team Member Onboarding

**User Actions (Each Team Member):**
1. Clicks invitation link
2. Sets password
3. Completes profile:
   - Name
   - Phone
   - Title
   - Photo
4. Reviews platform tour
5. Logs in to workspace

**System Actions:**
1. Activates user account
2. Sets up user preferences
3. Assigns default permissions
4. Creates notification preferences
5. Logs first login

**API Calls:**
```
POST /api/auth/accept-invitation
PUT /api/users/{id}/complete-profile
POST /api/users/{id}/activate
```

---

#### Phase 5: Data Import

**User Actions:**
1. Admin navigates to **Settings** → **Import**
2. Selects import type: "Candidates"
3. Downloads CSV template
4. Fills template with existing candidate data
5. Uploads CSV file (500 candidates)
6. Maps columns to fields
7. Clicks **"Start Import"**

**System Actions:**
1. Validates CSV format
2. Processes in batches (100 at a time)
3. Creates candidate records
4. Imports resumes (if URLs provided)
5. Runs AI resume parser (if enabled)
6. Creates search index entries
7. Shows progress: 100/500... 500/500 complete
8. Generates import report:
   - Successful: 485
   - Failed: 15 (shows errors)
   - Warnings: 30
9. Allows error download for correction

**API Calls:**
```
POST /api/import/candidates/upload
POST /api/import/candidates/validate
POST /api/import/candidates/process (batch)
GET /api/import/candidates/{importId}/status
GET /api/import/candidates/{importId}/report
```

---

#### Phase 6: Go-Live Checklist

**System Actions (Automated):**
1. Checks completion status:
   - [✓] Branding configured
   - [✓] Email connected
   - [✓] Team invited (3/3 accepted)
   - [✓] Candidates imported (485)
   - [ ] First job created
   - [ ] First submission made
   - [ ] Integration tested
2. Displays setup score: 70%
3. Suggests next steps

**User Actions:**
1. Creates first job posting
2. Submits first candidate
3. Completes setup

**System Actions:**
1. Marks onboarding complete
2. Sends congratulations email
3. Schedules customer success call
4. Enables full platform access
5. Starts billing (after trial ends)

**API Calls:**
```
GET /api/organizations/{id}/onboarding-status
POST /api/organizations/{id}/complete-onboarding
POST /api/emails/onboarding-complete
POST /api/integrations/calendly/schedule-success-call
```

---

## System Integration Points

### External Integrations Used Across Flows

1. **Email Service** (SendGrid/AWS SES)
   - Transactional emails
   - Bulk campaigns
   - Template management
   - Tracking (opens, clicks)

2. **Cloud Storage** (AWS S3/Azure Blob)
   - Resume storage
   - Document management
   - PDF generation
   - Asset hosting (logos, images)

3. **Calendar Integration** (Google/Outlook)
   - Availability checking
   - Event creation
   - Meeting invites
   - Sync scheduling

4. **Video Conferencing** (Zoom/Teams)
   - Meeting creation
   - Recording
   - Transcription
   - Webhooks

5. **E-Signature** (DocuSign/Adobe Sign)
   - Envelope creation
   - Signing workflow
   - Document download
   - Completion webhooks

6. **Payment Processing** (Stripe)
   - Subscription management
   - Payment collection
   - Invoicing
   - Webhook events

7. **Background Checks** (Checkr)
   - Screening initiation
   - Status tracking
   - Report retrieval
   - Compliance

8. **Job Boards** (LinkedIn, Indeed)
   - Job posting
   - Application sync
   - Candidate sourcing
   - Performance tracking

9. **AI Services** (OpenAI/Anthropic)
   - Resume parsing
   - JD generation
   - Semantic search
   - Interview intelligence
   - Offer letter generation

10. **Analytics** (Mixpanel/Amplitude)
    - Event tracking
    - User analytics
    - Conversion funnels
    - A/B testing

---

## Performance Metrics by Flow

### 1. Candidate Placement Flow
- **Average Duration:** 25 days
- **SLA Target:** 90 days
- **Success Rate:** 68%
- **Bottleneck:** Interview scheduling (6 days avg)
- **Automation Level:** 45%

### 2. Job Fulfillment Flow
- **Average Time-to-Fill:** 30 days
- **SLA Target:** 60 days
- **Fill Rate:** 72%
- **Bottleneck:** Candidate sourcing (12 days avg)
- **Automation Level:** 35%

### 3. Timesheet to Payment Flow
- **Average Cycle:** 7 days
- **SLA Target:** 14 days
- **Approval Rate:** 96%
- **Auto-Invoice Rate:** 100%
- **Automation Level:** 75%

### 4. Invoice Management Flow
- **Average Payment Time:** 25 days
- **SLA Target:** 30 days
- **Collection Rate:** 94%
- **Overdue Rate:** 6%
- **Automation Level:** 80%

---

## Error Handling & Edge Cases

### Common Error Scenarios

1. **Workflow Validation Failures**
   - Missing required fields
   - Invalid state transitions
   - Permission denied
   - SLA violations

2. **Integration Failures**
   - API timeouts
   - Rate limiting
   - Authentication errors
   - Webhook delivery failures

3. **Data Quality Issues**
   - Duplicate candidates
   - Invalid email addresses
   - Missing documents
   - Incomplete forms

4. **User Error Recovery**
   - Accidental deletions (soft delete + 30-day recovery)
   - Wrong state transitions (rollback support)
   - Duplicate submissions (merge tool)
   - Lost attachments (version history)

---

## Conclusion

These end-to-end flows demonstrate a complete, production-ready recruiting platform with:

- **Workflow Automation:** BPM workflows reduce manual work by 70%
- **Multi-Tenant Architecture:** Complete isolation and white-labeling
- **Integration Ecosystem:** 10+ external service integrations
- **AI-Powered Features:** Intelligence throughout the entire journey
- **Compliance & Audit:** Complete history tracking for all operations
- **Performance Optimization:** Sub-second response times, intelligent caching
- **User Experience:** Intuitive flows with minimal clicks to complete tasks

All flows work together seamlessly to provide an enterprise-grade recruiting platform that scales from 5 to 500+ users while maintaining performance and reliability.

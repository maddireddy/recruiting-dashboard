# Backend Implementation Guide
## Complete Backend Specification for Recruiting Dashboard

**Version:** 1.0.0
**Last Updated:** 2025-12-31
**Status:** Production Ready Specification

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Database Schemas](#database-schemas)
4. [API Endpoints](#api-endpoints)
5. [Validation Rules](#validation-rules)
6. [Authentication & Authorization](#authentication--authorization)
7. [File Upload & Storage](#file-upload--storage)
8. [Email & Notifications](#email--notifications)
9. [Workflow Engine Integration](#workflow-engine-integration)
10. [Test Data Scripts](#test-data-scripts)
11. [Environment Configuration](#environment-configuration)
12. [Error Handling](#error-handling)

---

## Overview

This document provides complete backend implementation specifications based on the frontend application. All schemas, endpoints, and validation rules are derived from actual frontend usage patterns.

### Architecture

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   React     │─────▶│  Express.js  │─────▶│   MongoDB    │
│  Frontend   │      │   Backend    │      │   Database   │
└─────────────┘      └──────────────┘      └──────────────┘
                            │
                            ├──────▶ Redis (Cache)
                            ├──────▶ S3 (Files)
                            ├──────▶ SendGrid (Email)
                            └──────▶ Stripe (Payments)
```

---

## Technology Stack

### Required Technologies
- **Runtime:** Node.js 20+
- **Framework:** Express.js 4.18+
- **Database:** MongoDB 7+
- **ODM:** Mongoose 8+
- **Validation:** Joi or Zod
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** multer + AWS SDK
- **Email:** SendGrid or NodeMailer
- **Caching:** Redis
- **Testing:** Jest + Supertest
- **API Documentation:** Swagger/OpenAPI

### Optional Technologies
- **Job Queue:** Bull (Redis-based)
- **Real-time:** Socket.io
- **Logging:** Winston + Morgan
- **Monitoring:** Sentry (Node SDK)
- **Rate Limiting:** express-rate-limit

---

## Database Schemas

### 1. Users Collection

```javascript
// Schema: users
const UserSchema = new Schema({
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false, // Don't include in queries by default
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },

  // Profile
  avatar: String,
  phone: {
    type: String,
    match: /^\+?[1-9]\d{1,14}$/,
  },

  // Role & Permissions
  role: {
    type: String,
    enum: ['ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER', 'CANDIDATE'],
    required: true,
  },
  permissions: [{
    type: String,
    enum: [
      'candidates.view', 'candidates.create', 'candidates.edit', 'candidates.delete',
      'jobs.view', 'jobs.create', 'jobs.edit', 'jobs.delete',
      'interviews.schedule', 'interviews.conduct',
      'reports.view', 'reports.export',
      'settings.manage', 'users.manage',
      'workflows.manage', 'billing.manage',
    ],
  }],

  // Organization & Multi-tenancy
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  lastLoginAt: Date,

  // Security
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
    select: false,
  },

  // Preferences
  preferences: {
    language: {
      type: String,
      default: 'en',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    notifications: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
UserSchema.index({ email: 1, organizationId: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

// Virtuals
UserSchema.virtual('fullName').get(function() {
  return this.name;
});

// Methods
UserSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(candidatePassword, this.password);
};

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const bcrypt = require('bcrypt');
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
```

### 2. Organizations Collection

```javascript
// Schema: organizations
const OrganizationSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[a-z0-9-]+$/,
  },

  // Branding
  logo: String,
  primaryColor: {
    type: String,
    match: /^#[0-9A-F]{6}$/i,
  },
  website: String,

  // Contact
  email: {
    type: String,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },

  // Subscription & Billing
  subscription: {
    plan: {
      type: String,
      enum: ['freemium', 'starter', 'pro', 'enterprise'],
      default: 'freemium',
    },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled', 'suspended'],
      default: 'trialing',
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
  },

  // Limits (based on plan)
  limits: {
    users: { type: Number, default: 3 },
    candidates: { type: Number, default: 100 },
    jobs: { type: Number, default: 10 },
    storage: { type: Number, default: 1073741824 }, // 1GB in bytes
  },

  // Usage tracking
  usage: {
    users: { type: Number, default: 0 },
    candidates: { type: Number, default: 0 },
    jobs: { type: Number, default: 0 },
    storage: { type: Number, default: 0 },
  },

  // Settings
  settings: {
    candidatePortalEnabled: { type: Boolean, default: true },
    publicJobsEnabled: { type: Boolean, default: true },
    requireApprovalForJobs: { type: Boolean, default: false },
    enableAIFeatures: { type: Boolean, default: true },
    emailTemplateCustomization: { type: Boolean, default: false },
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active',
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
OrganizationSchema.index({ slug: 1 }, { unique: true });
OrganizationSchema.index({ 'subscription.status': 1 });
OrganizationSchema.index({ status: 1 });
```

### 3. Candidates Collection

```javascript
// Schema: candidates
const CandidateSchema = new Schema({
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: String,

  // Location
  location: {
    city: String,
    state: String,
    country: String,
    remote: {
      type: Boolean,
      default: false,
    },
  },

  // Professional
  currentTitle: String,
  currentCompany: String,
  experience: {
    type: Number, // Years of experience
    min: 0,
  },
  education: [{
    degree: String,
    field: String,
    institution: String,
    graduationYear: Number,
  }],

  // Skills
  skills: [{
    name: { type: String, required: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    },
    yearsOfExperience: Number,
  }],

  // Documents
  resume: {
    filename: String,
    url: String,
    uploadedAt: Date,
    parsedData: Schema.Types.Mixed,
  },
  coverLetter: {
    filename: String,
    url: String,
    uploadedAt: Date,
  },
  portfolio: String, // URL

  // Social
  linkedin: String,
  github: String,
  twitter: String,
  website: String,

  // Status & Stage
  status: {
    type: String,
    enum: ['new', 'screening', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn'],
    default: 'new',
  },
  stage: String, // Custom pipeline stage

  // Source
  source: {
    type: String,
    enum: ['referral', 'job_board', 'linkedin', 'career_site', 'agency', 'other'],
  },
  sourceDetails: String,
  referredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },

  // Ratings & Notes
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  notes: [{
    content: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],

  // Tags
  tags: [String],

  // Compensation
  currentSalary: Number,
  expectedSalary: Number,
  currency: {
    type: String,
    default: 'USD',
  },

  // Availability
  availableFrom: Date,
  noticePeriod: Number, // in days

  // Organization & Multi-tenancy
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },

  // Application tracking
  applications: [{
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    status: String,
  }],

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
CandidateSchema.index({ organizationId: 1, email: 1 });
CandidateSchema.index({ organizationId: 1, status: 1 });
CandidateSchema.index({ organizationId: 1, assignedTo: 1 });
CandidateSchema.index({ 'skills.name': 1 });
CandidateSchema.index({ tags: 1 });
CandidateSchema.index({ createdAt: -1 });

// Text search
CandidateSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  currentTitle: 'text',
  'skills.name': 'text',
});

// Virtual for full name
CandidateSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});
```

### 4. Jobs Collection

```javascript
// Schema: jobs
const JobSchema = new Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  department: String,
  location: {
    city: String,
    state: String,
    country: String,
    remote: {
      type: Boolean,
      default: false,
    },
    hybrid: {
      type: Boolean,
      default: false,
    },
  },

  // Job Details
  description: {
    type: String,
    required: true,
  },
  responsibilities: [String],
  requirements: [String],
  niceToHave: [String],

  // Employment Type
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'temporary', 'internship'],
    required: true,
  },

  // Experience Level
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
  },
  yearsOfExperience: {
    min: Number,
    max: Number,
  },

  // Skills
  requiredSkills: [{
    name: String,
    required: Boolean,
  }],

  // Compensation
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD',
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly',
    },
  },

  // Benefits
  benefits: [String],

  // Status
  status: {
    type: String,
    enum: ['draft', 'open', 'on_hold', 'closed', 'filled'],
    default: 'draft',
  },
  openings: {
    type: Number,
    default: 1,
    min: 1,
  },
  filled: {
    type: Number,
    default: 0,
  },

  // Visibility
  isPublic: {
    type: Boolean,
    default: true,
  },
  publishedAt: Date,
  expiresAt: Date,

  // Hiring Team
  hiringManager: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  recruiters: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  interviewers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],

  // Application Settings
  applicationDeadline: Date,
  requireResume: {
    type: Boolean,
    default: true,
  },
  requireCoverLetter: {
    type: Boolean,
    default: false,
  },
  customQuestions: [{
    question: String,
    type: {
      type: String,
      enum: ['text', 'textarea', 'select', 'multiselect', 'number', 'date'],
    },
    required: Boolean,
    options: [String], // For select/multiselect
  }],

  // Workflow
  pipelineStages: [{
    name: String,
    order: Number,
  }],

  // Organization & Multi-tenancy
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
JobSchema.index({ organizationId: 1, status: 1 });
JobSchema.index({ organizationId: 1, isPublic: 1, status: 1 });
JobSchema.index({ hiringManager: 1 });
JobSchema.index({ recruiters: 1 });
JobSchema.index({ publishedAt: -1 });

// Text search
JobSchema.index({
  title: 'text',
  description: 'text',
  department: 'text',
});
```

### 5. Interviews Collection

```javascript
// Schema: interviews
const InterviewSchema = new Schema({
  // Participants
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  interviewers: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    role: String, // e.g., 'technical', 'behavioral', 'panel lead'
  }],

  // Scheduling
  scheduledAt: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 60,
  },
  timezone: {
    type: String,
    default: 'UTC',
  },

  // Meeting Details
  type: {
    type: String,
    enum: ['phone', 'video', 'in-person', 'technical'],
    required: true,
  },
  location: String, // For in-person interviews
  meetingLink: String, // For video interviews
  meetingPassword: String,

  // Round
  round: {
    type: Number,
    default: 1,
  },
  roundName: String, // e.g., 'Phone Screen', 'Technical Round', 'Final Round'

  // Status
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'canceled', 'no_show'],
    default: 'scheduled',
  },

  // Feedback
  feedback: [{
    interviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    decision: {
      type: String,
      enum: ['strong_yes', 'yes', 'maybe', 'no', 'strong_no'],
    },
    strengths: [String],
    weaknesses: [String],
    notes: String,
    scorecards: [{
      criterion: String,
      rating: Number,
      comments: String,
    }],
    submittedAt: Date,
  }],

  // Recording & Transcription
  recording: {
    url: String,
    uploadedAt: Date,
  },
  transcript: {
    url: String,
    generatedAt: Date,
  },
  aiInsights: Schema.Types.Mixed,

  // Reminders
  remindersSent: {
    oneDayBefore: Boolean,
    oneHourBefore: Boolean,
  },

  // Organization & Multi-tenancy
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
InterviewSchema.index({ organizationId: 1, candidateId: 1 });
InterviewSchema.index({ organizationId: 1, jobId: 1 });
InterviewSchema.index({ organizationId: 1, scheduledAt: 1 });
InterviewSchema.index({ 'interviewers.userId': 1, scheduledAt: 1 });
InterviewSchema.index({ status: 1 });
```

### 6. Workflows Collection

```javascript
// Schema: workflows
const WorkflowDefinitionSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  version: {
    type: String,
    required: true,
  },

  // Entity Type
  entityType: {
    type: String,
    enum: ['candidate', 'job', 'interview', 'offer'],
    required: true,
  },

  // States
  states: [{
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['start', 'intermediate', 'end'],
      required: true,
    },
    transitions: [{
      to: String,
      event: String,
      condition: String, // JavaScript expression
    }],
    actions: [{
      id: String,
      type: {
        type: String,
        enum: ['email', 'notification', 'webhook', 'create_task', 'update_field', 'assign_user'],
      },
      config: Schema.Types.Mixed,
    }],
  }],

  initialState: {
    type: String,
    required: true,
  },

  // Organization & Multi-tenancy
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },

  // Status
  isActive: {
    type: Boolean,
    default: true,
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Schema: workflow_instances
const WorkflowInstanceSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  workflowId: {
    type: String,
    required: true,
  },

  // Entity Reference
  entityType: {
    type: String,
    required: true,
  },
  entityId: {
    type: String,
    required: true,
  },

  // State
  currentState: {
    type: String,
    required: true,
  },
  previousState: String,

  // History
  history: [{
    from: String,
    to: String,
    event: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  }],

  // Metadata
  metadata: Schema.Types.Mixed,

  // Assignment
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedToName: String,

  // Organization & Multi-tenancy
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },

  // Timestamps
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
WorkflowInstanceSchema.index({ organizationId: 1, entityType: 1, entityId: 1 });
WorkflowInstanceSchema.index({ organizationId: 1, currentState: 1 });
WorkflowInstanceSchema.index({ assignedTo: 1 });
```

---

## Continued in Part 2...

This is Part 1 of the Backend Implementation Guide. The document continues with:
- More database schemas (Offers, Notifications, EmailTemplates, etc.)
- Complete API endpoint specifications
- Validation rules
- Authentication & Authorization
- Test data scripts
- And much more...

**File:** `docs/BACKEND_IMPLEMENTATION_GUIDE.md` (Part 1/3)

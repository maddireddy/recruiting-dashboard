# API Endpoints Specification
## Complete REST API Documentation

**Version:** 1.0.0
**Base URL:** `/api/v1`
**Authentication:** JWT Bearer Token

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Candidates](#candidates)
4. [Jobs](#jobs)
5. [Interviews](#interviews)
6. [Workflows](#workflows)
7. [Notifications](#notifications)
8. [Email Templates](#email-templates)
9. [Reports](#reports)
10. [File Uploads](#file-uploads)

---

## Authentication

### POST /auth/register
Register a new organization and admin user

**Request Body:**
```json
{
  "organization": {
    "name": "ACME Corp",
    "slug": "acme-corp",
    "email": "admin@acme.com"
  },
  "user": {
    "name": "John Doe",
    "email": "john@acme.com",
    "password": "SecurePass123!"
  }
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "john@acme.com",
      "name": "John Doe",
      "role": "ADMIN"
    },
    "organization": {
      "id": "...",
      "name": "ACME Corp",
      "slug": "acme-corp"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation:**
- `organization.name`: Required, 2-200 characters
- `organization.slug`: Required, unique, lowercase, alphanumeric + hyphens
- `organization.email`: Required, valid email
- `user.name`: Required, 2-100 characters
- `user.email`: Required, valid email, unique
- `user.password`: Required, min 8 characters, must contain uppercase, lowercase, number, special char

---

### POST /auth/login
Authenticate user and get JWT token

**Request Body:**
```json
{
  "email": "john@acme.com",
  "password": "SecurePass123!"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "695540e9d3bd0b377678c873",
      "email": "john@acme.com",
      "name": "John Doe",
      "role": "ADMIN",
      "organizationId": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

**Errors:**
- 401: Invalid credentials
- 403: Account suspended
- 404: User not found

---

### POST /auth/refresh
Refresh JWT token

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

---

### POST /auth/forgot-password
Request password reset

**Request Body:**
```json
{
  "email": "john@acme.com"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### POST /auth/reset-password
Reset password with token

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "NewSecurePass123!"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## Candidates

### GET /candidates
List all candidates with filtering, sorting, and pagination

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by status (new, screening, interviewing, offered, hired, rejected, withdrawn)
- `assignedTo`: Filter by assigned recruiter ID
- `skills`: Comma-separated skill names
- `search`: Search in name, email, title
- `sortBy`: Field to sort by (createdAt, updatedAt, firstName, rating)
- `order`: Sort order (asc, desc)

**Example Request:**
```
GET /candidates?page=1&limit=20&status=screening&sortBy=createdAt&order=desc
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "id": "...",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com",
        "phone": "+1234567890",
        "currentTitle": "Senior Developer",
        "currentCompany": "Tech Corp",
        "location": {
          "city": "San Francisco",
          "state": "CA",
          "country": "USA"
        },
        "skills": [
          { "name": "React", "level": "expert" },
          { "name": "Node.js", "level": "advanced" }
        ],
        "status": "screening",
        "overallRating": 4,
        "createdAt": "2024-12-01T10:00:00Z",
        "assignedTo": {
          "id": "...",
          "name": "John Recruiter"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

---

### GET /candidates/:id
Get candidate details

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "...",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "currentTitle": "Senior Developer",
    "currentCompany": "Tech Corp",
    "experience": 5,
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "remote": true
    },
    "skills": [
      { "name": "React", "level": "expert", "yearsOfExperience": 4 },
      { "name": "Node.js", "level": "advanced", "yearsOfExperience": 3 }
    ],
    "education": [
      {
        "degree": "B.S. Computer Science",
        "institution": "Stanford University",
        "graduationYear": 2018
      }
    ],
    "resume": {
      "filename": "jane_smith_resume.pdf",
      "url": "https://s3.amazonaws.com/...",
      "uploadedAt": "2024-12-01T10:00:00Z",
      "parsedData": { ... }
    },
    "linkedin": "https://linkedin.com/in/janesmith",
    "github": "https://github.com/janesmith",
    "status": "screening",
    "stage": "Technical Screen",
    "source": "linkedin",
    "overallRating": 4,
    "expectedSalary": 150000,
    "currency": "USD",
    "availableFrom": "2025-02-01",
    "notes": [
      {
        "content": "Strong technical background",
        "createdBy": { "id": "...", "name": "John Recruiter" },
        "createdAt": "2024-12-01T11:00:00Z"
      }
    ],
    "tags": ["senior", "react-expert", "remote"],
    "applications": [
      {
        "jobId": "...",
        "jobTitle": "Senior Frontend Developer",
        "appliedAt": "2024-12-01T10:00:00Z",
        "status": "interviewing"
      }
    ],
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-15T14:30:00Z"
  }
}
```

---

### POST /candidates
Create new candidate

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "currentTitle": "Senior Developer",
  "currentCompany": "Tech Corp",
  "experience": 5,
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "remote": true
  },
  "skills": [
    { "name": "React", "level": "expert", "yearsOfExperience": 4 },
    { "name": "Node.js", "level": "advanced", "yearsOfExperience": 3 }
  ],
  "linkedin": "https://linkedin.com/in/janesmith",
  "expectedSalary": 150000,
  "currency": "USD",
  "source": "linkedin"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "id": "...",
    "firstName": "Jane",
    "lastName": "Smith",
    ...
  }
}
```

**Validation:**
- `firstName`: Required, 1-100 characters
- `lastName`: Required, 1-100 characters
- `email`: Required, valid email format, unique within organization
- `phone`: Optional, valid E.164 format
- `skills[].name`: Required if skills provided
- `expectedSalary`: Optional, positive number

---

### PUT /candidates/:id
Update candidate

**Request Body:** (Partial update supported)
```json
{
  "status": "interviewing",
  "stage": "Technical Interview",
  "overallRating": 4,
  "tags": ["senior", "react-expert"]
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": { ... }
}
```

---

### DELETE /candidates/:id
Soft delete candidate

**Response:** 204 No Content

---

### POST /candidates/:id/upload-resume
Upload resume for candidate

**Request:** `multipart/form-data`
- `file`: Resume file (PDF, DOC, DOCX, max 5MB)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "resume": {
      "filename": "jane_smith_resume.pdf",
      "url": "https://s3.amazonaws.com/...",
      "uploadedAt": "2024-12-01T10:00:00Z",
      "parsedData": {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "skills": ["React", "Node.js", "TypeScript"],
        "experience": "5 years"
      }
    }
  }
}
```

---

### POST /candidates/:id/notes
Add note to candidate

**Request Body:**
```json
{
  "content": "Strong technical background, good culture fit"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "...",
      "content": "Strong technical background, good culture fit",
      "createdBy": { "id": "...", "name": "John Recruiter" },
      "createdAt": "2024-12-01T11:00:00Z"
    }
  }
}
```

---

## Jobs

### GET /jobs
List all jobs

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status (draft, open, on_hold, closed, filled)
- `department`: Filter by department
- `employmentType`: Filter by type (full-time, part-time, contract, etc.)
- `isPublic`: Filter public jobs (true/false)
- `search`: Search in title, description
- `sortBy`: Sort field
- `order`: Sort order

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "...",
        "title": "Senior Frontend Developer",
        "department": "Engineering",
        "location": {
          "city": "San Francisco",
          "state": "CA",
          "remote": true
        },
        "employmentType": "full-time",
        "experienceLevel": "senior",
        "status": "open",
        "openings": 2,
        "filled": 0,
        "salary": {
          "min": 140000,
          "max": 180000,
          "currency": "USD",
          "period": "yearly"
        },
        "isPublic": true,
        "publishedAt": "2024-12-01T00:00:00Z",
        "hiringManager": {
          "id": "...",
          "name": "Sarah Manager"
        },
        "createdAt": "2024-12-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### GET /jobs/:id
Get job details

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "Senior Frontend Developer",
    "department": "Engineering",
    "description": "We are looking for...",
    "responsibilities": [
      "Build scalable web applications",
      "Mentor junior developers"
    ],
    "requirements": [
      "5+ years of React experience",
      "Strong TypeScript skills"
    ],
    "niceToHave": [
      "Experience with Next.js",
      "GraphQL knowledge"
    ],
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "remote": true,
      "hybrid": false
    },
    "employmentType": "full-time",
    "experienceLevel": "senior",
    "yearsOfExperience": {
      "min": 5,
      "max": 10
    },
    "requiredSkills": [
      { "name": "React", "required": true },
      { "name": "TypeScript", "required": true },
      { "name": "Node.js", "required": false }
    ],
    "salary": {
      "min": 140000,
      "max": 180000,
      "currency": "USD",
      "period": "yearly"
    },
    "benefits": [
      "Health insurance",
      "401k matching",
      "Unlimited PTO"
    ],
    "status": "open",
    "openings": 2,
    "filled": 0,
    "isPublic": true,
    "publishedAt": "2024-12-01T00:00:00Z",
    "expiresAt": "2025-03-01T00:00:00Z",
    "hiringManager": { "id": "...", "name": "Sarah Manager" },
    "recruiters": [
      { "id": "...", "name": "John Recruiter" }
    ],
    "pipelineStages": [
      { "name": "Applied", "order": 1 },
      { "name": "Phone Screen", "order": 2 },
      { "name": "Technical Interview", "order": 3 },
      { "name": "Final Round", "order": 4 },
      { "name": "Offer", "order": 5 }
    ],
    "createdAt": "2024-12-01T00:00:00Z",
    "updatedAt": "2024-12-15T10:00:00Z"
  }
}
```

---

### POST /jobs
Create new job

**Request Body:**
```json
{
  "title": "Senior Frontend Developer",
  "department": "Engineering",
  "description": "We are looking for...",
  "responsibilities": ["Build scalable web applications"],
  "requirements": ["5+ years of React experience"],
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "remote": true
  },
  "employmentType": "full-time",
  "experienceLevel": "senior",
  "salary": {
    "min": 140000,
    "max": 180000,
    "currency": "USD"
  },
  "hiringManagerId": "...",
  "recruiterIds": ["..."],
  "status": "draft"
}
```

**Response:** 201 Created

**Validation:**
- `title`: Required, 5-200 characters
- `description`: Required, 100-10000 characters
- `employmentType`: Required, one of enum values
- `salary.min`: Must be less than salary.max
- `hiringManagerId`: Must be valid user ID with HIRING_MANAGER or ADMIN role

---

### PUT /jobs/:id/publish
Publish job (make it visible to candidates)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "...",
    "status": "open",
    "isPublic": true,
    "publishedAt": "2024-12-01T10:00:00Z"
  }
}
```

---

## Interviews

### GET /interviews
List interviews

**Query Parameters:**
- `candidateId`: Filter by candidate
- `jobId`: Filter by job
- `interviewerId`: Filter by interviewer
- `status`: Filter by status
- `from`: Start date (ISO 8601)
- `to`: End date (ISO 8601)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "interviews": [
      {
        "id": "...",
        "candidate": {
          "id": "...",
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "job": {
          "id": "...",
          "title": "Senior Frontend Developer"
        },
        "scheduledAt": "2024-12-20T14:00:00Z",
        "duration": 60,
        "type": "video",
        "round": 2,
        "roundName": "Technical Interview",
        "status": "scheduled",
        "interviewers": [
          {
            "user": { "id": "...", "name": "Tech Lead" },
            "role": "technical"
          }
        ],
        "meetingLink": "https://zoom.us/j/..."
      }
    ]
  }
}
```

---

### POST /interviews
Schedule new interview

**Request Body:**
```json
{
  "candidateId": "...",
  "jobId": "...",
  "scheduledAt": "2024-12-20T14:00:00Z",
  "duration": 60,
  "timezone": "America/Los_Angeles",
  "type": "video",
  "round": 2,
  "roundName": "Technical Interview",
  "interviewerIds": ["..."],
  "meetingLink": "https://zoom.us/j/..."
}
```

**Response:** 201 Created

**Validation:**
- `candidateId`: Required, valid candidate ID
- `jobId`: Required, valid job ID
- `scheduledAt`: Required, must be in future
- `duration`: Required, 15-480 minutes
- `type`: Required, one of enum values
- `interviewerIds`: Required, at least one interviewer

---

### PUT /interviews/:id/feedback
Submit interview feedback

**Request Body:**
```json
{
  "rating": 4,
  "decision": "yes",
  "strengths": ["Strong technical skills", "Good communication"],
  "weaknesses": ["Limited system design experience"],
  "notes": "Would be a great addition to the team",
  "scorecards": [
    {
      "criterion": "Technical Skills",
      "rating": 5,
      "comments": "Excellent React knowledge"
    },
    {
      "criterion": "Communication",
      "rating": 4,
      "comments": "Clear and concise"
    }
  ]
}
```

**Response:** 200 OK

---

## Workflows

### GET /workflows
List workflow definitions

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "workflows": [
      {
        "id": "workflow_candidate_screening",
        "name": "Candidate Screening",
        "description": "Automate candidate screening process",
        "entityType": "candidate",
        "version": "1.0.0",
        "isActive": true,
        "states": [...],
        "createdAt": "2024-12-01T00:00:00Z"
      }
    ]
  }
}
```

---

### POST /workflows
Create workflow definition

**Request Body:**
```json
{
  "id": "workflow_custom_candidate",
  "name": "Custom Candidate Workflow",
  "description": "Custom workflow for candidates",
  "entityType": "candidate",
  "version": "1.0.0",
  "states": [
    {
      "name": "new",
      "type": "start",
      "transitions": [
        {
          "to": "screening",
          "event": "start_screening"
        }
      ],
      "actions": [
        {
          "id": "welcome_email",
          "type": "email",
          "config": {
            "template": "welcome",
            "recipients": ["${metadata.candidateEmail}"]
          }
        }
      ]
    },
    {
      "name": "screening",
      "type": "intermediate",
      "transitions": [
        {
          "to": "interviewing",
          "event": "pass_screening"
        },
        {
          "to": "rejected",
          "event": "fail_screening"
        }
      ]
    },
    {
      "name": "rejected",
      "type": "end"
    }
  ],
  "initialState": "new"
}
```

**Response:** 201 Created

---

### POST /workflows/instances
Create workflow instance

**Request Body:**
```json
{
  "workflowId": "workflow_candidate_screening",
  "entityType": "candidate",
  "entityId": "candidate_id_here",
  "metadata": {
    "candidateName": "Jane Smith",
    "candidateEmail": "jane@example.com"
  }
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "instance": {
      "id": "instance_...",
      "workflowId": "workflow_candidate_screening",
      "entityType": "candidate",
      "entityId": "candidate_id_here",
      "currentState": "new",
      "metadata": {...},
      "startedAt": "2024-12-01T10:00:00Z"
    }
  }
}
```

---

### POST /workflows/instances/:id/transitions/:transitionId
Trigger workflow transition

**Request Body:**
```json
{
  "event": "start_screening",
  "metadata": {
    "reviewedBy": "recruiter_id"
  }
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "instance": {
      "id": "instance_...",
      "currentState": "screening",
      "previousState": "new",
      "history": [...]
    }
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_SERVER_ERROR` (500)

---

**Total Endpoints:** 50+
**Authentication:** Required on all endpoints except auth and public career pages
**Rate Limiting:** 100 requests per minute per user

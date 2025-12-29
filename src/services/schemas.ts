import { z } from 'zod';

// Client validation schemas
export const clientContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  title: z.string().min(1, 'Contact title is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[\d\s\-\(\)\+]{10,}$/, 'Enter a valid phone number (at least 10 digits)'),
  mobile: z.string().regex(/^[\d\s\-\(\)\+]{10,}$/, 'Enter a valid phone number (at least 10 digits)').optional().or(z.literal('')),
  isPrimary: z.boolean().optional(),
});

export const clientSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  contacts: z.array(clientContactSchema).min(1, 'At least one contact is required'),
  accountManager: z.string().optional(),
  status: z.enum(['ACTIVE', 'PROSPECT', 'INACTIVE']).optional(),
  notes: z.string().optional(),
});

export const clientCreateSchema = clientSchema;
export const clientUpdateSchema = clientSchema.partial();

// Job validation schemas
export const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  client: z.string().min(1, 'Client is required'),
  location: z.string().min(1, 'Location is required'),
  jobType: z.enum(['FULL_TIME', 'CONTRACT', 'CONTRACT_TO_HIRE']),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'INTERVIEW', 'OFFERED', 'CLOSED']).optional(),
  description: z.string().min(1, 'Job description is required'),
  requiredSkills: z.array(z.string()).min(1, 'At least one required skill is required'),
  preferredSkills: z.array(z.string()).optional(),
  minExperience: z.number().min(0, 'Minimum experience must be non-negative'),
  maxExperience: z.number().min(0, 'Maximum experience must be non-negative'),
  rateMin: z.number().min(0, 'Minimum rate must be non-negative'),
  rateMax: z.number().min(0, 'Maximum rate must be non-negative'),
  rateCurrency: z.string().min(1, 'Currency is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  openings: z.number().min(1, 'At least one opening is required'),
});

export const jobCreateSchema = jobSchema;
export const jobUpdateSchema = jobSchema.partial();

// Candidate validation schemas
export const candidateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[\d\s\-\(\)\+]{10,}$/, 'Enter a valid phone number (at least 10 digits)'),
  visaStatus: z.string().min(1, 'Visa status is required'),
  primarySkills: z.array(z.string()).min(1, 'At least one primary skill is required'),
  secondarySkills: z.array(z.string()).optional(),
  totalExperience: z.number().min(0, 'Total experience must be non-negative'),
  availability: z.string().min(1, 'Availability is required'),
  status: z.enum(['AVAILABLE', 'INTERVIEWING', 'PLACED', 'ON_HOLD']).optional(),
  currentLocation: z.object({
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
  }).optional(),
  rateExpectation: z.object({
    hourly: z.number().min(0, 'Hourly rate must be non-negative'),
    currency: z.string().min(1, 'Currency is required'),
    negotiable: z.boolean(),
  }).optional(),
  resumeUrl: z.string().url('Invalid resume URL').optional().or(z.literal('')),
  linkedInUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
});

export const candidateCreateSchema = candidateSchema;
export const candidateUpdateSchema = candidateSchema.partial();

// Submission validation schemas
export const submissionSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required'),
  jobId: z.string().min(1, 'Job ID is required'),
  status: z.enum(['SUBMITTED', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED']).optional(),
  submittedAt: z.string().optional(),
  notes: z.string().optional(),
});

export const submissionCreateSchema = submissionSchema;
export const submissionUpdateSchema = submissionSchema.partial();

// Interview validation schemas
export const interviewSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  candidateId: z.string().min(1, 'Candidate ID is required'),
  scheduledAt: z.string().min(1, 'Scheduled date/time is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').optional(),
  interviewer: z.string().min(1, 'Interviewer is required'),
  type: z.enum(['PHONE', 'VIDEO', 'IN_PERSON']).optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
});

export const interviewCreateSchema = interviewSchema;
export const interviewUpdateSchema = interviewSchema.partial();

// API Key validation schemas
export const apiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
});

export const apiKeyCreateSchema = apiKeySchema;

// White Label validation schemas
export const whiteLabelSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  brandColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color (e.g., #FF0000)').optional(),
});

export const whiteLabelUpdateSchema = whiteLabelSchema;

// Email validation schemas
export const emailTemplateSchema = z.object({
  templateName: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  senderEmail: z.string().email('Invalid sender email'),
  senderName: z.string().min(1, 'Sender name is required'),
  body: z.string().min(1, 'Email body is required'),
  variables: z.array(z.string()).optional(),
});

export const emailTemplateCreateSchema = emailTemplateSchema;
export const emailTemplateUpdateSchema = emailTemplateSchema.partial();

// Document validation schemas
export const documentSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().min(1, 'File size must be positive'),
  fileUrl: z.string().url('Invalid file URL'),
  candidateId: z.string().optional(),
  jobId: z.string().optional(),
  clientId: z.string().optional(),
  documentType: z.enum(['RESUME', 'COVER_LETTER', 'PORTFOLIO', 'CERTIFICATE', 'OTHER']).optional(),
});

export const documentCreateSchema = documentSchema;
export const documentUpdateSchema = documentSchema.partial();

// User/Authentication validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
});

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.string().min(1, 'Role is required'),
});

// Team/User management validation schemas
export const teamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  invitedBy: z.string().min(1, 'Invited by is required'),
});

export const teamMemberCreateSchema = teamMemberSchema;
export const teamMemberUpdateSchema = teamMemberSchema.partial();

// Report validation schemas
export const reportSchema = z.object({
  reportName: z.string().min(1, 'Report name is required'),
  reportType: z.string().min(1, 'Report type is required'),
  parameters: z.record(z.any()).optional(),
  generatedAt: z.string().optional(),
});

export const reportCreateSchema = reportSchema;
export const reportUpdateSchema = reportSchema.partial();

// Billing validation schemas
export const billingSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  description: z.string().min(1, 'Description is required'),
  billingDate: z.string().min(1, 'Billing date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
});

export const billingCreateSchema = billingSchema;
export const billingUpdateSchema = billingSchema.partial();
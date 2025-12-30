/**
 * Staffing & Operations Management - Type Definitions
 * Comprehensive types for internal chat, activity tracking, timesheets, and invoicing
 */

// ==================== INTERNAL CHAT ====================

export type ChatChannelType = 'organization' | 'team' | 'candidate' | 'direct';
export type MessageType = 'text' | 'file' | 'image' | 'system';
export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

export interface ChatChannel {
  id: string;
  organizationId: string;
  type: ChatChannelType;
  name: string;
  description?: string;
  memberIds: string[];
  candidateId?: string; // For candidate-specific channels
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToId?: string;
  reactions?: MessageReaction[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
  count: number;
}

export interface UserPresence {
  userId: string;
  userName: string;
  avatar?: string;
  status: UserStatus;
  lastSeen: string;
  currentActivity?: string;
}

// ==================== CANDIDATE ASSIGNMENT ====================

export type AssignmentStatus = 'active' | 'paused' | 'completed' | 'transferred';
export type ActivityType = 'call' | 'email' | 'meeting' | 'interview' | 'submission' | 'note' | 'status_change';

export interface CandidateAssignment {
  id: string;
  candidateId: string;
  candidateName: string;
  assignedToId: string;
  assignedToName: string;
  assignedById: string;
  assignedByName: string;
  status: AssignmentStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateActivity {
  id: string;
  candidateId: string;
  assignmentId?: string;
  userId: string;
  userName: string;
  type: ActivityType;
  title: string;
  description?: string;
  duration?: number; // in minutes
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface RecruiterWorkload {
  userId: string;
  userName: string;
  activeCandidates: number;
  totalActivities: number;
  callsMade: number;
  emailsSent: number;
  interviewsScheduled: number;
  submissionsToday: number;
  hoursLogged: number;
}

// ==================== EMPLOYEE TIMESHEETS ====================

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
export type TimesheetEntryType = 'recruiting' | 'administrative' | 'training' | 'meeting' | 'other';

export interface TimesheetEntry {
  id: string;
  timesheetId: string;
  date: string;
  candidateId?: string;
  candidateName?: string;
  jobId?: string;
  jobTitle?: string;
  type: TimesheetEntryType;
  description: string;
  hoursWorked: number;
  billableHours: number;
  hourlyRate?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeTimesheet {
  id: string;
  organizationId: string;
  employeeId: string;
  employeeName: string;
  weekStartDate: string;
  weekEndDate: string;
  status: TimesheetStatus;
  entries: TimesheetEntry[];
  totalHours: number;
  totalBillableHours: number;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== CONTRACTOR TIMESHEETS ====================

export type ContractorTimesheetStatus = 'pending' | 'submitted' | 'client_review' | 'approved' | 'disputed' | 'invoiced';

export interface ContractorTimesheetEntry {
  id: string;
  date: string;
  hoursWorked: number;
  overtimeHours: number;
  breakTime: number;
  description: string;
  clientApproved: boolean;
  clientApprovedBy?: string;
  clientApprovedAt?: string;
}

export interface ContractorTimesheet {
  id: string;
  organizationId: string;
  candidateId: string; // Placed candidate now working as contractor
  candidateName: string;
  clientId: string;
  clientName: string;
  placementId: string;
  weekStartDate: string;
  weekEndDate: string;
  status: ContractorTimesheetStatus;
  entries: ContractorTimesheetEntry[];
  totalHours: number;
  totalOvertimeHours: number;
  hourlyRate: number;
  overtimeRate: number;
  totalAmount: number;
  submittedAt?: string;
  clientApprovedAt?: string;
  invoiceId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== INVOICE MANAGEMENT ====================

export type InvoiceType = 'client_billing' | 'vendor_payment' | 'contractor_payment';
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial_paid' | 'paid' | 'overdue' | 'cancelled';
export type PaymentTerms = 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'due_on_receipt';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  candidateId?: string;
  candidateName?: string;
  timesheetId?: string;
  weekEnding?: string;
  hoursWorked?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  organizationId: string;
  type: InvoiceType;

  // Client/Vendor Information
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientAddress?: string;

  vendorId?: string;
  vendorName?: string;

  contractorId?: string;
  contractorName?: string;

  // Invoice Details
  issueDate: string;
  dueDate: string;
  paymentTerms: PaymentTerms;
  status: InvoiceStatus;

  // Line Items
  lineItems: InvoiceLineItem[];

  // Financials
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  totalAmount: number;
  amountPaid: number;
  amountDue: number;

  // Payment Tracking
  payments: InvoicePayment[];

  // Metadata
  notes?: string;
  attachments?: string[];
  pdfUrl?: string;

  sentAt?: string;
  viewedAt?: string;
  paidAt?: string;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'check' | 'wire' | 'ach' | 'credit_card' | 'cash' | 'other';
  referenceNumber?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// ==================== PLACEMENT TRACKING ====================

export interface Placement {
  id: string;
  organizationId: string;
  candidateId: string;
  candidateName: string;
  clientId: string;
  clientName: string;
  jobId: string;
  jobTitle: string;
  placementType: 'contract' | 'permanent' | 'contract_to_hire';
  startDate: string;
  endDate?: string;

  // Rates & Billing
  billRate: number; // What client pays
  payRate: number; // What contractor receives
  marginRate: number; // Staffing firm's margin
  marginPercentage: number;

  // Status
  status: 'active' | 'completed' | 'terminated' | 'on_hold';
  requiresTimesheet: boolean;

  // Point of Contact
  recruiterId: string;
  recruiterName: string;
  accountManagerId?: string;
  accountManagerName?: string;

  createdAt: string;
  updatedAt: string;
}

// ==================== ANALYTICS & REPORTING ====================

export interface StaffingMetrics {
  organizationId: string;
  period: string;

  // Activity Metrics
  totalCandidateActivities: number;
  totalCallsMade: number;
  totalEmailsSent: number;
  totalInterviews: number;
  totalSubmissions: number;

  // Timesheet Metrics
  totalEmployeeHours: number;
  totalContractorHours: number;
  totalBillableHours: number;
  averageHoursPerEmployee: number;

  // Financial Metrics
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  averageCollectionDays: number;

  // Placement Metrics
  activePlacements: number;
  totalRevenue: number;
  totalMargin: number;
  averageMarginPercentage: number;
}

export interface RecruiterPerformance {
  userId: string;
  userName: string;
  period: string;

  // Activity
  candidatesManaged: number;
  activitiesLogged: number;
  hoursWorked: number;

  // Results
  submissions: number;
  interviews: number;
  placements: number;

  // Revenue
  totalBillings: number;
  totalMargin: number;

  // Efficiency
  avgTimeToSubmission: number; // days
  avgTimeToPlacement: number; // days
  conversionRate: number; // submissions to placements
}

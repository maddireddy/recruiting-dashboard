export interface Report {
  id?: string;
  tenantId?: string;
  reportName: string;
  reportType: 'PLACEMENT' | 'REVENUE' | 'PIPELINE' | 'ACTIVITY' | 'CANDIDATE_SUMMARY' | 'CLIENT_SUMMARY' | 'CUSTOM';
  description?: string;
  filters?: Record<string, any>;
  columns?: string[];
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  isPublic: boolean;
  isScheduled: boolean;
  scheduleFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  recipients?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  lastRunAt?: string;
}

export interface ReportExecution {
  id: string;
  tenantId: string;
  reportId: string;
  executedBy: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  resultCount?: number;
  fileUrl?: string;
  errorMessage?: string;
  executedAt: string;
  completedAt?: string;
}

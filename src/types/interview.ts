export interface PanelMember {
  name: string;
  email: string;
  role?: string;
  isExternal?: boolean;
}

export interface Interview {
  id?: string;
  tenantId?: string;
  jobId: string;
  candidateId: string;
  submissionId?: string;
  scheduledAt: string;
  mode: 'ONSITE' | 'REMOTE' | 'PHONE' | 'VIDEO';
  meetingLink?: string;
  panel: PanelMember[];
  feedback?: string;
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  createdAt?: string;
  updatedAt?: string;
}

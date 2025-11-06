export interface Submission {
  id: string;
  tenantId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  client: string;
  status: 'SUBMITTED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEWED' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN';
  submittedBy: string;
  submittedDate: string;
  proposedRate: number;
  rateCurrency: string;
  interviewDate?: string;
  interviewFeedback?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubmissionStatus = Submission['status'];

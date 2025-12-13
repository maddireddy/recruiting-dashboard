import api from './api';

export interface InterviewRecording {
  id: string;
  interviewId: string;
  s3Url: string;
  transcriptionText?: string;
  aiSummary?: string;
}

export const interviewIntelligenceService = {
  listByInterview: async (interviewId: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    const { data } = await api.get(`/interviews/${interviewId}/recordings`, { headers });
    return data as InterviewRecording[];
  },
};

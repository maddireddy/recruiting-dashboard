import api from './api';
import type { Interview } from '../types/interview';

export const interviewService = {
  getAll: (page = 0, size = 50) => 
    api.get<{ content: Interview[] }>(`/interviews?page=${page}&size=${size}`),
  
  getById: (id: string) => 
    api.get<Interview>(`/interviews/${id}`),
  
  getByCandidate: (candidateId: string) => 
    api.get<Interview[]>(`/interviews/candidate/${candidateId}`),
  
  getByJob: (jobId: string) => 
    api.get<Interview[]>(`/interviews/job/${jobId}`),
  
  getBySubmission: (submissionId: string) => 
    api.get<Interview[]>(`/interviews/submission/${submissionId}`),
  
  getByStatus: (status: string) => 
    api.get<Interview[]>(`/interviews/status/${status}`),
  
  getUpcoming: (start: string, end: string) => 
    api.get<Interview[]>(`/interviews/upcoming?start=${start}&end=${end}`),
  
  create: (interview: Partial<Interview>) => 
    api.post<Interview>('/interviews', interview),
  
  update: (id: string, interview: Partial<Interview>) => 
    api.put<Interview>(`/interviews/${id}`, interview),
  
  delete: (id: string) => 
    api.delete(`/interviews/${id}`)
};
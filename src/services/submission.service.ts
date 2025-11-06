import api from './api';
import type { Submission } from '../types/submission';

export const submissionService = {
  getAll: (page = 0, size = 50) => 
    api.get<{ content: Submission[] }>(`/submissions?page=${page}&size=${size}`),
  
  getById: (id: string) => 
    api.get<Submission>(`/submissions/${id}`),
  
  getByCandidate: (candidateId: string) => 
    api.get<Submission[]>(`/submissions/candidate/${candidateId}`),
  
  getByJob: (jobId: string) => 
    api.get<Submission[]>(`/submissions/job/${jobId}`),
  
  getByStatus: (status: string) => 
    api.get<Submission[]>(`/submissions/status/${status}`),
  
  create: (submission: Partial<Submission>) => 
    api.post<Submission>('/submissions', submission),
  
  update: (id: string, submission: Partial<Submission>) => 
    api.put<Submission>(`/submissions/${id}`, submission),
  
  delete: (id: string) => 
    api.delete(`/submissions/${id}`)
};

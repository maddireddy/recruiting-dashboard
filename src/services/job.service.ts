import api from './api';
import type { Job } from '../types/job';

export const jobService = {
  getAll: (page = 0, size = 100) => 
    api.get<{ content: Job[] }>(`/jobs?page=${page}&size=${size}`),

  getByStatus: (status: string) => 
    api.get<Job[]>(`/jobs/status/${status}`),

  getById: (id: string) => 
    api.get<Job>(`/jobs/${id}`),

  create: (job: Partial<Job>) => 
    api.post<Job>('/jobs', job),

  update: (id: string, job: Partial<Job>) => 
    api.put<Job>(`/jobs/${id}`, job),

  delete: (id: string) => 
    api.delete(`/jobs/${id}`),

  // Generic search/filter
  search: async (params: Record<string, any>) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          queryParams.set(key, value.join(','));
        } else {
          queryParams.set(key, value);
        }
      }
    });
    // Use /jobs/search for generic search
    if (params.q) {
      return api.get<{ content: Job[] }>(`/jobs/search?q=${params.q}&${queryParams.toString()}`);
    }
    // Fallback to /jobs for no search
    return api.get<{ content: Job[] }>(`/jobs?${queryParams.toString()}`);
  },
};

import api from './api';
import type { Candidate } from '../types';

export const candidateService = {
  getAll: (page = 0, size = 10) => 
    api.get<{ content: Candidate[]; totalElements: number; totalPages: number }>(`/candidates?page=${page}&size=${size}`),
  
  getById: (id: string) => 
    api.get<Candidate>(`/candidates/${id}`),
  
  create: (candidate: Partial<Candidate>) => 
    api.post<Candidate>('/candidates', candidate),
  
  update: (id: string, candidate: Partial<Candidate>) => 
    api.put<Candidate>(`/candidates/${id}`, candidate),
  
  delete: (id: string) => 
    api.delete(`/candidates/${id}`),
  
  search: (params: Record<string, any>) => {
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
    return api.get<{ content: Candidate[]; totalPages?: number }>(`/candidates/search?${queryParams.toString()}`);
  }
};

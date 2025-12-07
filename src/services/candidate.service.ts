import api from './api';
import type { Candidate } from '../types';

export const candidateService = {
  getAll: (page = 0, size = 10) => 
    api.get<{ content: Candidate[]; totalElements: number; totalPages: number }>(`/candidates?page=${page}&size=${size}`)
      .then((resp) => {
        console.debug('[candidateService.getAll] response', resp.data);
        return resp;
      }),
  
  getById: (id: string) => 
    api.get<Candidate>(`/candidates/${id}`),
  
  create: (candidate: Partial<Candidate>) => 
    api.post<Candidate>('/candidates', candidate),
  
  update: (id: string, candidate: Partial<Candidate>) => 
    api.put<Candidate>(`/candidates/${id}`, candidate),
  
  delete: (id: string) => 
    api.delete(`/candidates/${encodeURIComponent(id)}`)
      .then((resp) => {
        console.debug('[candidateService.delete] response', resp.status, resp.data);
        return resp;
      }),
  
  search: (params: Record<string, string | number | boolean | string[] | undefined>) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          queryParams.set(key, value.join(','));
        } else {
          queryParams.set(key, String(value));
        }
      }
    });
    return api.get<{ content: Candidate[]; totalPages?: number; totalElements?: number }>(`/candidates/search?${queryParams.toString()}`);
  }
};

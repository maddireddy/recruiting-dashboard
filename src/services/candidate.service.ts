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
  
  create: async (candidate: Partial<Candidate>) => {
    if (import.meta.env.DEV) {
      console.debug('[candidateService.create] payload', candidate);
    }
    try {
      const resp = await api.post<Candidate>('/candidates', candidate);
      if (import.meta.env.DEV) {
        console.debug('[candidateService.create] response', resp.status, resp.data);
      }
      return resp;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug('[candidateService.create] error', error);
      }
      throw error;
    }
  },
  
  update: async (id: string, candidate: Partial<Candidate>) => {
    if (import.meta.env.DEV) {
      console.debug('[candidateService.update] payload', { id, candidate });
    }
    try {
      const resp = await api.put<Candidate>(`/candidates/${encodeURIComponent(id)}`, candidate);
      if (import.meta.env.DEV) {
        console.debug('[candidateService.update] response', resp.status, resp.data);
      }
      return resp;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug('[candidateService.update] error', error);
      }
      throw error;
    }
  },
  
  delete: async (id: string) => {
    const resp = await api.delete(`/candidates/${encodeURIComponent(id)}`);
    console.debug('[candidateService.delete] response', resp.status);
    return id;
  },

  deleteMany: async (ids: string[]) => {
    if (!ids.length) {
      return {
        successes: [] as string[],
        failures: [] as Array<{ id: string; reason: unknown }>,
      };
    }
    const results = await Promise.allSettled(ids.map((id) => candidateService.delete(id)));
    const successes: string[] = [];
    const failures: Array<{ id: string; reason: unknown }> = [];
    results.forEach((result, index) => {
      const id = ids[index];
      if (result.status === 'fulfilled') {
        successes.push(result.value);
      } else {
        failures.push({ id, reason: result.reason });
      }
    });
    if (import.meta.env.DEV) {
      console.debug('[candidateService.deleteMany]', { successes, failures });
    }
    return { successes, failures };
  },
  
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

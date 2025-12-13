import api from './api';
import type { Job } from '../types/job';

export const jobService = {
  getAll: async (page = 0, size = 100, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<{ content: Job[] }>(`/jobs?page=${page}&size=${size}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[jobService.getAll] response', resp.data);
      }
      return resp.data.content || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[jobService.getAll] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },

  getByStatus: async (status: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Job[]>(`/jobs/status/${status}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[jobService.getByStatus] response', resp.data);
      }
      return resp.data || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[jobService.getByStatus] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },

  getById: async (id: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Job>(`/jobs/${id}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[jobService.getById] response', resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[jobService.getById] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },

  create: async (job: Partial<Job>, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.post<Job>('/jobs', job, { headers });
      if (import.meta.env.DEV) {
        console.debug('[jobService.create] response', resp.status, resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[jobService.create] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },

  update: async (id: string, job: Partial<Job>, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.put<Job>(`/jobs/${id}`, job, { headers });
      if (import.meta.env.DEV) {
        console.debug('[jobService.update] response', resp.status, resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[jobService.update] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },

  delete: async (id: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.delete(`/jobs/${id}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[jobService.delete] response', resp.status);
      }
      return id;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[jobService.delete] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },

  // Generic search/filter
  search: async (params: Record<string, string | number | boolean | string[]>, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
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
    try {
      // Use /jobs/search for generic search
      if (params.q) {
        const resp = await api.get<{ content: Job[] }>(`/jobs/search?q=${params.q}&${queryParams.toString()}`, { headers });
        if (import.meta.env.DEV) {
          console.debug('[jobService.search] response', resp.data);
        }
        return resp.data.content || [];
      }
      // Fallback to /jobs for no search
      const resp = await api.get<{ content: Job[] }>(`/jobs?${queryParams.toString()}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[jobService.search] response', resp.data);
      }
      return resp.data.content || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[jobService.search] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },
};

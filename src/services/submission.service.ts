import api from './api';
import type { Submission } from '../types/submission';

export const submissionService = {
  getAll: async (page = 0, size = 50, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<{ content: Submission[] }>(`/submissions?page=${page}&size=${size}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[submissionService.getAll] response', resp.data);
      }
      return resp.data.content || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[submissionService.getAll] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },

  getById: async (id: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Submission>(`/submissions/${id}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[submissionService.getById] response', resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[submissionService.getById] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },

  getByCandidate: async (candidateId: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Submission[]>(`/submissions/candidate/${candidateId}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[submissionService.getByCandidate] response', resp.data);
      }
      return resp.data || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[submissionService.getByCandidate] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },

  getByJob: async (jobId: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Submission[]>(`/submissions/job/${jobId}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[submissionService.getByJob] response', resp.data);
      }
      return resp.data || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[submissionService.getByJob] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },

  getByStatus: async (status: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Submission[]>(`/submissions/status/${status}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[submissionService.getByStatus] response', resp.data);
      }
      return resp.data || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[submissionService.getByStatus] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },

  create: async (submission: Partial<Submission>, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.post<Submission>('/submissions', submission, { headers });
      if (import.meta.env.DEV) {
        console.debug('[submissionService.create] response', resp.status, resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[submissionService.create] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },

  update: async (id: string, submission: Partial<Submission>, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.put<Submission>(`/submissions/${id}`, submission, { headers });
      if (import.meta.env.DEV) {
        console.debug('[submissionService.update] response', resp.status, resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[submissionService.update] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },

  delete: async (id: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.delete(`/submissions/${id}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[submissionService.delete] response', resp.status);
      }
      return id;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[submissionService.delete] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },
};

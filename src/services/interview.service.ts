import api from './api';
import type { Interview } from '../types/interview';

export const interviewService = {
  getAll: async (page = 0, size = 50, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<{ content: Interview[] }>(`/interviews?page=${page}&size=${size}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[interviewService.getAll] response', resp.data);
      }
      return resp.data.content || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[interviewService.getAll] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },

  getById: async (id: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Interview>(`/interviews/${id}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[interviewService.getById] response', resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[interviewService.getById] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },

  getByCandidate: async (candidateId: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Interview[]>(`/interviews/candidate/${candidateId}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[interviewService.getByCandidate] response', resp.data);
      }
      return resp.data || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[interviewService.getByCandidate] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },

  getByJob: async (jobId: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Interview[]>(`/interviews/job/${jobId}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[interviewService.getByJob] response', resp.data);
      }
      return resp.data || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[interviewService.getByJob] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },

  getBySubmission: async (submissionId: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Interview[]>(`/interviews/submission/${submissionId}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[interviewService.getBySubmission] response', resp.data);
      }
      return resp.data || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[interviewService.getBySubmission] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },

  getByStatus: async (status: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Interview[]>(`/interviews/status/${status}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[interviewService.getByStatus] response', resp.data);
      }
      return resp.data || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[interviewService.getByStatus] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },

  getUpcoming: async (start: string, end: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Interview[]>(`/interviews/upcoming?start=${start}&end=${end}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[interviewService.getUpcoming] response', resp.data);
      }
      return resp.data || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[interviewService.getUpcoming] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },

  create: async (interview: Partial<Interview>, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.post<Interview>('/interviews', interview, { headers });
      if (import.meta.env.DEV) {
        console.debug('[interviewService.create] response', resp.status, resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[interviewService.create] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },

  update: async (id: string, interview: Partial<Interview>, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.put<Interview>(`/interviews/${id}`, interview, { headers });
      if (import.meta.env.DEV) {
        console.debug('[interviewService.update] response', resp.status, resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[interviewService.update] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },

  delete: async (id: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.delete(`/interviews/${id}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[interviewService.delete] response', resp.status);
      }
      return id;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[interviewService.delete] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },
};
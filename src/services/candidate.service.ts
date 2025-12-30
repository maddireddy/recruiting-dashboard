import api from './api';
import type { Candidate } from '../types';

export interface AdminCandidate {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  status: 'active' | 'applied' | 'interview' | 'offer' | 'hired' | 'rejected';
  skills: string[];
  experience: number;
  createdAt: string;
  updatedAt: string;
}

const getHeaders = (tenantId?: string) => {
  const token = localStorage.getItem('token');
  const headers: any = { 'Authorization': `Bearer ${token}` };
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  return headers;
};

export async function listCandidates(tenantId?: string): Promise<Candidate[]> {
  try {
    const { data } = await api.get('/api/candidates', {
      headers: getHeaders(tenantId)
    });
    return Array.isArray(data) ? data : data?.content || [];
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
}

export async function getCandidate(id: string, tenantId?: string): Promise<Candidate | null> {
  try {
    const { data } = await api.get(`/api/candidates/${id}`, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error(`Error fetching candidate ${id}:`, error);
    return null;
  }
}

export async function createCandidate(candidate: Omit<AdminCandidate, 'id' | 'createdAt' | 'updatedAt'>, tenantId?: string): Promise<Candidate> {
  try {
    const { data } = await api.post('/api/candidates', candidate, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error('Error creating candidate:', error);
    throw error;
  }
}

export async function updateCandidate(id: string, candidate: Partial<Candidate>, tenantId?: string): Promise<Candidate> {
  try {
    const { data } = await api.put(`/api/candidates/${id}`, candidate, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error('Error updating candidate:', error);
    throw error;
  }
}

export async function deleteCandidate(id: string, tenantId?: string): Promise<void> {
  try {
    await api.delete(`/api/candidates/${id}`, {
      headers: getHeaders(tenantId)
    });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    throw error;
  }
}

// Keep legacy service interface for backward compatibility
export const candidateService = {
  getAll: async (page = 0, size = 10, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<{ content: Candidate[]; totalElements: number; totalPages: number }>(`/candidates?page=${page}&size=${size}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[candidateService.getAll] response', resp.data);
      }
      return resp.data.content || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[candidateService.getAll] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },
  
  getById: async (id: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Candidate>(`/candidates/${id}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[candidateService.getById] response', resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[candidateService.getById] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },
  
  create: async (candidate: Partial<Candidate>, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    if (import.meta.env.DEV) {
      console.debug('[candidateService.create] payload', candidate);
    }
    try {
      const resp = await api.post<Candidate>('/candidates', candidate, { headers });
      if (import.meta.env.DEV) {
        console.debug('[candidateService.create] response', resp.status, resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[candidateService.create] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },
  
  update: async (id: string, candidate: Partial<Candidate>, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    if (import.meta.env.DEV) {
      console.debug('[candidateService.update] payload', { id, candidate });
    }
    try {
      const resp = await api.put<Candidate>(`/candidates/${encodeURIComponent(id)}`, candidate, { headers });
      if (import.meta.env.DEV) {
        console.debug('[candidateService.update] response', resp.status, resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[candidateService.update] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },
  
  delete: async (id: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.delete(`/candidates/${encodeURIComponent(id)}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[candidateService.delete] response', resp.status);
      }
      return id;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[candidateService.delete] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },

  search: async (params: Record<string, string | number | boolean | string[] | undefined>, tenantId?: string) => {
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
      const resp = await api.get<{ content: Candidate[]; totalPages?: number; totalElements?: number }>(`/candidates/search?${queryParams.toString()}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[candidateService.search] response', resp.data);
      }
      return resp.data.content || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[candidateService.search] error', error?.response?.status, error?.message);
      }
      return [];
    }
  }
};

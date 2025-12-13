import api from './api';
import type { Client } from '../types/client';

export const clientService = {
  getAll: async (page = 0, size = 20, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<{content: Client[]}>(`/clients?page=${page}&size=${size}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[clientService.getAll] response', resp.data);
      }
      return resp.data.content || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[clientService.getAll] error', error?.response?.status, error?.message);
      }
      // Return empty array as safe fallback
      return [];
    }
  },
  
  getById: async (id: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Client>(`/clients/${id}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[clientService.getById] response', resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[clientService.getById] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },
  
  getByStatus: async (status: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<Client[]>(`/clients/status/${status}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[clientService.getByStatus] response', resp.data);
      }
      return resp.data || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[clientService.getByStatus] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },
  
  search: async (name: string, page = 0, size = 20, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.get<{content: Client[]}>(`/clients/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[clientService.search] response', resp.data);
      }
      return resp.data.content || [];
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[clientService.search] error', error?.response?.status, error?.message);
      }
      return [];
    }
  },
  
  create: async (client: Partial<Client>, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.post<Client>('/clients', client, { headers });
      if (import.meta.env.DEV) {
        console.debug('[clientService.create] response', resp.status, resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[clientService.create] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },
  
  update: async (id: string, client: Partial<Client>, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.put<Client>(`/clients/${id}`, client, { headers });
      if (import.meta.env.DEV) {
        console.debug('[clientService.update] response', resp.status, resp.data);
      }
      return resp.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[clientService.update] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },
  
  delete: async (id: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const resp = await api.delete(`/clients/${id}`, { headers });
      if (import.meta.env.DEV) {
        console.debug('[clientService.delete] response', resp.status);
      }
      return id;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.debug('[clientService.delete] error', error?.response?.status, error?.message);
      }
      throw error;
    }
  },
};
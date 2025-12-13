import api from './api';
import type { SavedSearch } from '../types/savedSearch';

function tenantHeaders(tenantId?: string) {
  const headers: Record<string, string> = {};
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  return { headers };
}

export const savedSearchService = {
  list: async (tenantId?: string) => {
    const resp = await api.get<SavedSearch[]>('/saved-searches', tenantHeaders(tenantId));
    return resp.data;
  },
  get: async (id: string, tenantId?: string) => {
    const resp = await api.get<SavedSearch>(`/saved-searches/${id}`, tenantHeaders(tenantId));
    return resp.data;
  },
  create: async (data: Partial<SavedSearch>, tenantId?: string) => {
    const resp = await api.post<SavedSearch>('/saved-searches', data, tenantHeaders(tenantId));
    return resp.data;
  },
  update: async (id: string, data: Partial<SavedSearch>, tenantId?: string) => {
    const resp = await api.put<SavedSearch>(`/saved-searches/${id}`, data, tenantHeaders(tenantId));
    return resp.data;
  },
  delete: async (id: string, tenantId?: string) => {
    await api.delete(`/saved-searches/${id}`, tenantHeaders(tenantId));
    return id;
  },
};

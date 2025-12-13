import api from './api';

export interface ApiKey {
  id?: string;
  name?: string;
  key?: string;
  scopes: string[];
  isActive?: boolean;
  createdAt?: string;
}

export const apiKeysService = {
  list: async (tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const { data } = await api.get('/apikeys', { headers });
      return (data as ApiKey[]) ?? [];
    } catch (err: any) {
      console.warn('[apiKeysService.list] falling back to empty list', err?.response?.status, err?.message);
      return [];
    }
  },
  create: async (payload: { name: string; scopes: string[] }, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    const { data } = await api.post('/apikeys', payload, { headers });
    return data as ApiKey;
  },
  revoke: async (id: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    await api.delete(`/apikeys/${id}`, { headers });
  },
};

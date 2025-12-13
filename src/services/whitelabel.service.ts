import api from './api';

export interface WhiteLabelConfig {
  id?: string;
  domain: string;
  logoUrl?: string;
  brandColor?: string;
}

export const whiteLabelService = {
  get: async (tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const { data } = await api.get('/whitelabel', { headers });
      return data as WhiteLabelConfig;
    } catch (err: any) {
      console.warn('[whiteLabelService.get] failed', err?.response?.status, err?.message);
      // Return a safe default to keep UI rendering
      return { domain: '', logoUrl: '', brandColor: '#3b82f6' } as WhiteLabelConfig;
    }
  },
  save: async (config: WhiteLabelConfig, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    const { data } = await api.post('/whitelabel', config, { headers });
    return data as WhiteLabelConfig;
  },
};

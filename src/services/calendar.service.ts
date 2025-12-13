import api from './api';

export interface CalendarSync {
  id: string;
  userId: string;
  provider: 'GOOGLE' | 'OUTLOOK';
  accessToken?: string;
  refreshToken?: string;
}

export const calendarService = {
  list: async (tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    const { data } = await api.get('/calendar/syncs', { headers });
    return data as CalendarSync[];
  },
  connectGoogle: async (userId: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    return api.post('/calendar/google/connect', { userId }, { headers });
  },
  connectOutlook: async (userId: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    return api.post('/calendar/outlook/connect', { userId }, { headers });
  },
};

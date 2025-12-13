import api from './api';

export interface SilverMedalist {
  id: string;
  candidateId: string;
  previousJobId: string;
  interviewScore?: number;
}

export const rediscoveryService = {
  list: async (tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    const { data } = await api.get('/silver-medalists', { headers });
    return data as SilverMedalist[];
  },
};

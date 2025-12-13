import api from './api';

export const complianceService = {
  generateOfccpReport: async (tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    const { data } = await api.get('/compliance/reports/ofccp', { headers });
    return data;
  },
};

import api from './api';

export interface Vendor {
  id?: string;
  companyName: string;
  contactEmail?: string;
  status?: 'APPROVED' | 'PENDING';
}

export const vendorService = {
  list: async (tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const { data } = await api.get('/vendors', { headers });
      return (data as Vendor[]) ?? [];
    } catch (err: any) {
      console.warn('[vendorService.list] falling back to empty list', err?.response?.status, err?.message);
      return [];
    }
  },
  create: async (vendor: Vendor, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    const { data } = await api.post('/vendors', vendor, { headers });
    return data as Vendor;
  },
};

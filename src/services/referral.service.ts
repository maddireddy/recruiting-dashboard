import api from './api';

export interface Referral {
  id?: string;
  candidateId: string;
  referredByUserId: string;
  bonusAmount?: number;
  status?: 'PENDING' | 'PAID';
}

export const referralService = {
  list: async (tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const { data } = await api.get('/referrals', { headers });
      return (data as Referral[]) ?? [];
    } catch (err: any) {
      console.warn('[referralService.list] falling back to empty list', err?.response?.status, err?.message);
      return [];
    }
  },
  create: async (referral: Referral, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    const { data } = await api.post('/referrals', referral, { headers });
    return data as Referral;
  },
};

import api from './api';

export interface BillingPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
}

export interface Subscription {
  id: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Invoice {
  id: string;
  amount: string;
  status: string;
  date: string;
  invoiceUrl?: string;
}

export const billingService = {
  getPlans: async (tenantId?: string): Promise<BillingPlan[]> => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    const { data } = await api.get('/billing/plans', { headers });
    return data;
  },

  getCurrentSubscription: async (tenantId?: string): Promise<Subscription | null> => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const { data } = await api.get('/billing/subscription', { headers });
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No active subscription
      }
      throw error;
    }
  },

  getInvoices: async (page: number = 0, size: number = 10, tenantId?: string): Promise<Invoice[]> => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    const { data } = await api.get('/billing/invoices', {
      headers,
      params: { page, size }
    });
    return data;
  },

  checkout: async (planId: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    const { data } = await api.post('/billing/checkout', { planId }, { headers });
    return data as { url: string };
  },
};

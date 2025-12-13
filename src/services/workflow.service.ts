import api from './api';

export interface Workflow {
  id?: string;
  name: string;
  triggerEvent: string;
  actions: string[];
}

export const workflowService = {
  list: async (tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    try {
      const { data } = await api.get('/workflows', { headers });
      return (data as Workflow[]) ?? [];
    } catch (err: any) {
      console.warn('[workflowService.list] falling back to empty list', err?.response?.status, err?.message);
      return [];
    }
  },
  create: async (wf: Workflow, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    const { data } = await api.post('/workflows', wf, { headers });
    return data as Workflow;
  },
};

import api from './api';

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  timestamp: string;
}

export const auditService = {
  list: async (tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    // Placeholder: if backend endpoint not yet present, returns empty
    const { data } = await api.get('/audit-logs', { headers });
    return data as AuditLog[];
  },
};

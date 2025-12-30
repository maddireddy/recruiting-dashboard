import api from './api';

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
  entity: 'CANDIDATE' | 'JOB' | 'INTERVIEW' | 'OFFER' | 'USER' | 'DOCUMENT' | 'EMAIL';
  entityId: string;
  entityName: string;
  description: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

const getHeaders = (tenantId?: string) => {
  const token = localStorage.getItem('token');
  const headers: any = { 'Authorization': `Bearer ${token}` };
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  return headers;
};

export async function listAuditLogs(tenantId?: string): Promise<AuditLog[]> {
  try {
    const { data } = await api.get('/api/audit-logs', {
      headers: getHeaders(tenantId)
    });
    return Array.isArray(data) ? data : data?.content || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

export async function getAuditLogsByEntity(entity: string, tenantId?: string): Promise<AuditLog[]> {
  try {
    const { data } = await api.get('/api/audit-logs', {
      params: { entity },
      headers: getHeaders(tenantId)
    });
    return Array.isArray(data) ? data : data?.content || [];
  } catch (error) {
    console.error(`Error fetching audit logs for entity ${entity}:`, error);
    return [];
  }
}

export async function getAuditLogsByAction(action: string, tenantId?: string): Promise<AuditLog[]> {
  try {
    const { data } = await api.get('/api/audit-logs', {
      params: { action },
      headers: getHeaders(tenantId)
    });
    return Array.isArray(data) ? data : data?.content || [];
  } catch (error) {
    console.error(`Error fetching audit logs for action ${action}:`, error);
    return [];
  }
}

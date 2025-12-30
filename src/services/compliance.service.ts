import api from './api';

export interface Compliance {
  id: string;
  tenantId: string;
  framework: 'GDPR' | 'CCPA' | 'HIPAA' | 'SOC2';
  status: 'compliant' | 'non-compliant' | 'partial';
  lastAudit?: string;
  nextAudit?: string;
  items: string[];
  certificationUrl?: string;
  expiresAt?: string;
}

const getHeaders = (tenantId?: string) => {
  const token = localStorage.getItem('token');
  const headers: any = { 'Authorization': `Bearer ${token}` };
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  return headers;
};

export async function listCompliance(tenantId?: string): Promise<Compliance[]> {
  try {
    const { data } = await api.get('/api/compliance', {
      headers: getHeaders(tenantId)
    });
    return Array.isArray(data) ? data : data?.content || [];
  } catch (error) {
    console.error('Error fetching compliance:', error);
    return [];
  }
}

export async function getCompliance(id: string, tenantId?: string): Promise<Compliance | null> {
  try {
    const { data } = await api.get(`/api/compliance/${id}`, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error(`Error fetching compliance ${id}:`, error);
    return null;
  }
}

export async function createCompliance(compliance: Omit<Compliance, 'id'>, tenantId?: string): Promise<Compliance> {
  try {
    const { data } = await api.post('/api/compliance', compliance, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error('Error creating compliance:', error);
    throw error;
  }
}

export async function updateCompliance(id: string, compliance: Partial<Compliance>, tenantId?: string): Promise<Compliance> {
  try {
    const { data } = await api.put(`/api/compliance/${id}`, compliance, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error('Error updating compliance:', error);
    throw error;
  }
}

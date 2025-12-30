import api from './api';

export interface ApiKey {
  id: string;
  tenantId: string;
  name: string;
  key: string;
  type: 'service' | 'webhook' | 'external';
  scopes: string[];
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  description?: string;
}

const getHeaders = (tenantId?: string) => {
  const token = localStorage.getItem('token');
  const headers: any = { 'Authorization': `Bearer ${token}` };
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  return headers;
};

export async function listApiKeys(tenantId?: string): Promise<ApiKey[]> {
  try {
    const { data } = await api.get('/api/api-keys', {
      headers: getHeaders(tenantId)
    });
    return Array.isArray(data) ? data : data?.content || [];
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return [];
  }
}

export async function createApiKey(apiKey: Omit<ApiKey, 'id' | 'key' | 'createdAt'>, tenantId?: string): Promise<ApiKey> {
  try {
    const { data } = await api.post('/api/api-keys', apiKey, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
}

export async function updateApiKey(id: string, apiKey: Partial<ApiKey>, tenantId?: string): Promise<ApiKey> {
  try {
    const { data } = await api.put(`/api/api-keys/${id}`, apiKey, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error('Error updating API key:', error);
    throw error;
  }
}

export async function revokeApiKey(id: string, tenantId?: string): Promise<void> {
  try {
    await api.post(`/api/api-keys/${id}/revoke`, {}, {
      headers: getHeaders(tenantId)
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    throw error;
  }
}

export async function deleteApiKey(id: string, tenantId?: string): Promise<void> {
  try {
    await api.delete(`/api/api-keys/${id}`, {
      headers: getHeaders(tenantId)
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
}

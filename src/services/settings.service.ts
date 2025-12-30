import api from './api';

export interface Setting {
  id: string;
  tenantId: string;
  key: string;
  value: any;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsCategory {
  organization: Record<string, any>;
  email: Record<string, any>;
  branding: Record<string, any>;
  integrations: Record<string, any>;
  security: Record<string, any>;
  data: Record<string, any>;
  ai: Record<string, any>;
}

const getHeaders = (tenantId?: string) => {
  const token = localStorage.getItem('token');
  const headers: any = { 'Authorization': `Bearer ${token}` };
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  return headers;
};

export async function listSettings(tenantId?: string): Promise<Setting[]> {
  try {
    const { data } = await api.get('/api/settings', {
      headers: getHeaders(tenantId)
    });
    return Array.isArray(data) ? data : data?.content || [];
  } catch (error) {
    console.error('Error fetching settings:', error);
    return [];
  }
}

export async function getSetting(key: string, tenantId?: string): Promise<Setting | null> {
  try {
    const { data } = await api.get(`/api/settings/${key}`, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return null;
  }
}

export async function getSettingsByCategory(category: string, tenantId?: string): Promise<Setting[]> {
  try {
    const { data } = await api.get(`/api/settings/category/${category}`, {
      headers: getHeaders(tenantId)
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching ${category} settings:`, error);
    return [];
  }
}

export async function createSetting(setting: Omit<Setting, 'id' | 'createdAt' | 'updatedAt'>, tenantId?: string): Promise<Setting> {
  try {
    const { data } = await api.post('/api/settings', setting, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error('Error creating setting:', error);
    throw error;
  }
}

export async function updateSetting(key: string, setting: Partial<Setting>, tenantId?: string): Promise<Setting> {
  try {
    const { data } = await api.put(`/api/settings/${key}`, setting, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error('Error updating setting:', error);
    throw error;
  }
}

export async function deleteSetting(key: string, tenantId?: string): Promise<void> {
  try {
    await api.delete(`/api/settings/${key}`, {
      headers: getHeaders(tenantId)
    });
  } catch (error) {
    console.error('Error deleting setting:', error);
    throw error;
  }
}

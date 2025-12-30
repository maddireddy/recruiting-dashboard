import api from './api';

export interface WhiteLabel {
  id: string;
  tenantId: string;
  companyName: string;
  domain: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  emailTemplate: string;
  enabled: boolean;
}

const getHeaders = (tenantId?: string) => {
  const token = localStorage.getItem('token');
  const headers: any = { 'Authorization': `Bearer ${token}` };
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  return headers;
};

export async function getWhiteLabel(tenantId?: string): Promise<WhiteLabel | null> {
  try {
    const { data } = await api.get('/api/white-label', {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error('Error fetching white label:', error);
    return null;
  }
}

export async function updateWhiteLabel(whiteLabel: Partial<WhiteLabel>, tenantId?: string): Promise<WhiteLabel> {
  try {
    const { data } = await api.put('/api/white-label', whiteLabel, {
      headers: getHeaders(tenantId)
    });
    return data;
  } catch (error) {
    console.error('Error updating white label:', error);
    throw error;
  }
}

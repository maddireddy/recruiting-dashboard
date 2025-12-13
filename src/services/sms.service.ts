import api from './api';
import type { SmsCampaign, SmsCommunication } from '../types/sms';

function tenantHeaders(tenantId?: string) {
  const headers: Record<string, string> = {};
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  return { headers };
}

export const smsService = {
  // Campaigns
  listCampaigns: async (params: { status?: string; from?: string; to?: string }, tenantId?: string) => {
    const resp = await api.get<SmsCampaign[]>('/sms-campaigns', { ...tenantHeaders(tenantId), params });
    return resp.data;
  },
  getCampaign: async (id: string, tenantId?: string) => {
    const resp = await api.get<SmsCampaign>(`/sms-campaigns/${id}`, tenantHeaders(tenantId));
    return resp.data;
  },
  createCampaign: async (data: Partial<SmsCampaign>, tenantId?: string) => {
    const resp = await api.post<SmsCampaign>('/sms-campaigns', data, tenantHeaders(tenantId));
    return resp.data;
  },
  updateCampaign: async (id: string, data: Partial<SmsCampaign>, tenantId?: string) => {
    const resp = await api.put<SmsCampaign>(`/sms-campaigns/${id}`, data, tenantHeaders(tenantId));
    return resp.data;
  },
  deleteCampaign: async (id: string, tenantId?: string) => {
    await api.delete(`/sms-campaigns/${id}`, tenantHeaders(tenantId));
    return id;
  },
  scheduleCampaign: async (id: string, whenISO: string, tenantId?: string) => {
    const resp = await api.post<SmsCampaign>(`/sms-campaigns/${id}/schedule`, null, {
      ...tenantHeaders(tenantId),
      params: { when: whenISO },
    });
    return resp.data;
  },
  sendCampaign: async (id: string, counts: { sent?: number; delivered?: number; failed?: number }, tenantId?: string) => {
    const resp = await api.post<SmsCampaign>(`/sms-campaigns/${id}/send`, null, {
      ...tenantHeaders(tenantId),
      params: counts,
    });
    return resp.data;
  },
  campaignMetrics: async (params: { status?: string }, tenantId?: string) => {
    const resp = await api.get<any>('/sms-campaigns/metrics', { ...tenantHeaders(tenantId), params });
    return resp.data;
  },

  // Communications
  listComms: async (params: { campaignId?: string; recipientPhone?: string; status?: string; from?: string; to?: string }, tenantId?: string) => {
    const resp = await api.get<SmsCommunication[]>('/sms-communications', { ...tenantHeaders(tenantId), params });
    return resp.data;
  },
  getComm: async (id: string, tenantId?: string) => {
    const resp = await api.get<SmsCommunication>(`/sms-communications/${id}`, tenantHeaders(tenantId));
    return resp.data;
  },
  createComm: async (data: Partial<SmsCommunication>, tenantId?: string) => {
    const resp = await api.post<SmsCommunication>('/sms-communications', data, tenantHeaders(tenantId));
    return resp.data;
  },
  updateComm: async (id: string, data: Partial<SmsCommunication>, tenantId?: string) => {
    const resp = await api.put<SmsCommunication>(`/sms-communications/${id}`, data, tenantHeaders(tenantId));
    return resp.data;
  },
  deleteComm: async (id: string, tenantId?: string) => {
    await api.delete(`/sms-communications/${id}`, tenantHeaders(tenantId));
    return id;
  },
  resendComm: async (id: string, tenantId?: string) => {
    const resp = await api.post<SmsCommunication>(`/sms-communications/${id}/resend`, null, tenantHeaders(tenantId));
    return resp.data;
  },
};
 

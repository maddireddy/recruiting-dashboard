import api from './api';
import type { VendorSubmittal } from '../types/vendorSubmittal';

function tenantHeaders(tenantId?: string) {
  const headers: Record<string, string> = {};
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  return { headers };
}

export const vendorSubmittalService = {
  list: async (tenantId?: string) => {
    const resp = await api.get<VendorSubmittal[]>('/vendor-submittals', tenantHeaders(tenantId));
    return resp.data;
  },
  get: async (id: string, tenantId?: string) => {
    const resp = await api.get<VendorSubmittal>(`/vendor-submittals/${id}`, tenantHeaders(tenantId));
    return resp.data;
  },
  create: async (data: Partial<VendorSubmittal>, tenantId?: string) => {
    const resp = await api.post<VendorSubmittal>('/vendor-submittals', data, tenantHeaders(tenantId));
    return resp.data;
  },
  update: async (id: string, data: Partial<VendorSubmittal>, tenantId?: string) => {
    const resp = await api.put<VendorSubmittal>(`/vendor-submittals/${id}`, data, tenantHeaders(tenantId));
    return resp.data;
  },
  delete: async (id: string, tenantId?: string) => {
    await api.delete(`/vendor-submittals/${id}`, tenantHeaders(tenantId));
    return id;
  },
};

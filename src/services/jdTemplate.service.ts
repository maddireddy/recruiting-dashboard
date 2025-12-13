import api from './api';
import type { JobDescriptionTemplate } from '../types/jobDescriptionTemplate';

function tenantHeaders(tenantId?: string) {
  const headers: Record<string, string> = {};
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  return { headers };
}

export const jdTemplateService = {
  list: async (tenantId?: string) => {
    const resp = await api.get<JobDescriptionTemplate[]>('/job-description-templates', tenantHeaders(tenantId));
    return resp.data;
  },
  get: async (id: string, tenantId?: string) => {
    const resp = await api.get<JobDescriptionTemplate>(`/job-description-templates/${id}`, tenantHeaders(tenantId));
    return resp.data;
  },
  create: async (data: Partial<JobDescriptionTemplate>, tenantId?: string) => {
    const resp = await api.post<JobDescriptionTemplate>('/job-description-templates', data, tenantHeaders(tenantId));
    return resp.data;
  },
  update: async (id: string, data: Partial<JobDescriptionTemplate>, tenantId?: string) => {
    const resp = await api.put<JobDescriptionTemplate>(`/job-description-templates/${id}`, data, tenantHeaders(tenantId));
    return resp.data;
  },
  delete: async (id: string, tenantId?: string) => {
    await api.delete(`/job-description-templates/${id}`, tenantHeaders(tenantId));
    return id;
  },
};

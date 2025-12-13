import api from './api';
import type { EeoRecord, EeoReport } from '../types/eeo';

const resource = '/eeo-records';

export const eeoService = {
  async list(tenantId?: string): Promise<EeoRecord[]> {
    const res = await api.get(resource, {
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return res.data;
  },

  async create(payload: Partial<EeoRecord>, tenantId?: string): Promise<EeoRecord> {
    const res = await api.post(resource, payload, {
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return res.data;
  },

  async update(id: string, payload: Partial<EeoRecord>, tenantId?: string): Promise<EeoRecord> {
    const res = await api.put(`${resource}/${id}`, payload, {
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return res.data;
  },

  async delete(id: string, tenantId?: string): Promise<string> {
    await api.delete(`${resource}/${id}`, {
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return id;
  },

  async report(tenantId?: string): Promise<EeoReport> {
    const res = await api.get('/eeo-report', {
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return res.data;
  },
};

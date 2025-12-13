import api from './api';
import type { CandidateSourcingTask } from '../types/candidateSourcing';

const resource = '/candidate-sourcings';

export const candidateSourcingService = {
  async list(tenantId?: string): Promise<CandidateSourcingTask[]> {
    const res = await api.get(resource, {
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return res.data;
  },

  async get(id: string, tenantId?: string): Promise<CandidateSourcingTask> {
    const res = await api.get(`${resource}/${id}`, {
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return res.data;
  },

  async create(payload: Partial<CandidateSourcingTask>, tenantId?: string): Promise<CandidateSourcingTask> {
    const res = await api.post(resource, payload, {
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return res.data;
  },

  async update(id: string, payload: Partial<CandidateSourcingTask>, tenantId?: string): Promise<CandidateSourcingTask> {
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
};

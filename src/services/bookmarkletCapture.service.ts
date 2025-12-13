import api from './api';
import type { BookmarkletCapture } from '../types/bookmarkletCapture';

const resource = '/bookmarklet-captures';

export const bookmarkletCaptureService = {
  async list(tenantId?: string): Promise<BookmarkletCapture[]> {
    const res = await api.get(resource, {
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return res.data;
  },

  async get(id: string, tenantId?: string): Promise<BookmarkletCapture> {
    const res = await api.get(`${resource}/${id}`, {
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return res.data;
  },

  async create(payload: Partial<BookmarkletCapture>, tenantId?: string): Promise<BookmarkletCapture> {
    const res = await api.post(resource, payload, {
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return res.data;
  },

  async update(id: string, payload: Partial<BookmarkletCapture>, tenantId?: string): Promise<BookmarkletCapture> {
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

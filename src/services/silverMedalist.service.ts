import api from './api';
import type { SilverMedalist, SilverMedalistCreate, SilverMedalistUpdate } from '../types/silverMedalist';

const base = '/silver-medalists';

export async function listSilverMedalists(tenantId?: string): Promise<SilverMedalist[]> {
  const { data } = await api.get(base, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function getSilverMedalist(id: string, tenantId?: string): Promise<SilverMedalist> {
  const { data } = await api.get(`${base}/${id}`, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function createSilverMedalist(payload: SilverMedalistCreate, tenantId?: string): Promise<SilverMedalist> {
  const { data } = await api.post(base, payload, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function updateSilverMedalist(payload: SilverMedalistUpdate, tenantId?: string): Promise<SilverMedalist> {
  const { id, ...rest } = payload;
  const { data } = await api.put(`${base}/${id}`, rest, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function deleteSilverMedalist(id: string, tenantId?: string): Promise<string> {
  await api.delete(`${base}/${id}`, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return id;
}

export async function reengageSilverMedalist(id: string, tenantId?: string): Promise<SilverMedalist> {
  const { data } = await api.post(`${base}/${id}/reengage`, {}, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

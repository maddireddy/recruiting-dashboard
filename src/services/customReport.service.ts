import api from './api';
import type { CustomReport, CustomReportCreate, CustomReportUpdate, CustomReportResultRow } from '../types/customReport';

const base = '/custom-reports';

export async function listCustomReports(tenantId?: string): Promise<CustomReport[]> {
  const { data } = await api.get(base, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function getCustomReport(id: string, tenantId?: string): Promise<CustomReport> {
  const { data } = await api.get(`${base}/${id}`, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function createCustomReport(payload: CustomReportCreate, tenantId?: string): Promise<CustomReport> {
  const { data } = await api.post(base, payload, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function updateCustomReport(payload: CustomReportUpdate, tenantId?: string): Promise<CustomReport> {
  const { id, ...rest } = payload;
  const { data } = await api.put(`${base}/${id}`, rest, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function deleteCustomReport(id: string, tenantId?: string): Promise<string> {
  await api.delete(`${base}/${id}`, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return id;
}

export async function runCustomReport(id: string, tenantId?: string): Promise<CustomReportResultRow[]> {
  const { data } = await api.post(`${base}/${id}/run`, {}, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function exportCustomReport(id: string, format: 'csv' | 'xlsx', tenantId?: string): Promise<Blob> {
  const { data } = await api.post(
    `${base}/${id}/export`,
    { format },
    { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined, responseType: 'blob' as any }
  );
  return data;
}

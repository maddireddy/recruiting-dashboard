import api from './api';
import type { InterviewGuide, InterviewGuideCreate, InterviewGuideUpdate } from '../types/interviewGuide';

const base = '/interview-guides';

export async function listInterviewGuides(tenantId?: string): Promise<InterviewGuide[]> {
  const { data } = await api.get(base, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function getInterviewGuide(id: string, tenantId?: string): Promise<InterviewGuide> {
  const { data } = await api.get(`${base}/${id}`, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function createInterviewGuide(payload: InterviewGuideCreate, tenantId?: string): Promise<InterviewGuide> {
  const { data } = await api.post(base, payload, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function updateInterviewGuide(payload: InterviewGuideUpdate, tenantId?: string): Promise<InterviewGuide> {
  const { id, ...rest } = payload;
  const { data } = await api.put(`${base}/${id}`, rest, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function deleteInterviewGuide(id: string, tenantId?: string): Promise<string> {
  await api.delete(`${base}/${id}`, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return id;
}

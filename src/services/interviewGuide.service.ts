import api from './api';
import type { InterviewGuide, InterviewGuideCreate, InterviewGuideUpdate } from '../types/interviewGuide';

const base = '/api/interview-guides';

export async function listInterviewGuides(tenantId?: string): Promise<InterviewGuide[]> {
  const token = localStorage.getItem('token');
  const headers: any = {
    'Authorization': `Bearer ${token}`,
  };
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  
  const { data } = await api.get(base, { headers });
  return Array.isArray(data) ? data : data?.content || [];
}

export async function getInterviewGuide(id: string, tenantId?: string): Promise<InterviewGuide> {
  const token = localStorage.getItem('token');
  const headers: any = {
    'Authorization': `Bearer ${token}`,
  };
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  
  const { data } = await api.get(`${base}/${id}`, { headers });
  return data;
}

export async function createInterviewGuide(payload: InterviewGuideCreate, tenantId?: string): Promise<InterviewGuide> {
  const token = localStorage.getItem('token');
  const headers: any = {
    'Authorization': `Bearer ${token}`,
  };
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  
  const { data } = await api.post(base, payload, { headers });
  return data;
}

export async function updateInterviewGuide(payload: InterviewGuideUpdate, tenantId?: string): Promise<InterviewGuide> {
  const { id, ...rest } = payload;
  const token = localStorage.getItem('token');
  const headers: any = {
    'Authorization': `Bearer ${token}`,
  };
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  
  const { data } = await api.put(`${base}/${id}`, rest, { headers });
  return data;
}

export async function deleteInterviewGuide(id: string, tenantId?: string): Promise<string> {
  const token = localStorage.getItem('token');
  const headers: any = {
    'Authorization': `Bearer ${token}`,
  };
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  
  await api.delete(`${base}/${id}`, { headers });
  return id;
}

import api from './api';
import type { InterviewRecording, InterviewRecordingCreate, InterviewRecordingUpdate } from '../types/interviewRecording';

const base = '/interview-recordings';

export async function listInterviewRecordings(tenantId?: string): Promise<InterviewRecording[]> {
  const { data } = await api.get(base, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function getInterviewRecording(id: string, tenantId?: string): Promise<InterviewRecording> {
  const { data } = await api.get(`${base}/${id}`, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function createInterviewRecording(payload: InterviewRecordingCreate, tenantId?: string): Promise<InterviewRecording> {
  const { data } = await api.post(base, payload, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function updateInterviewRecording(payload: InterviewRecordingUpdate, tenantId?: string): Promise<InterviewRecording> {
  const { id, ...rest } = payload;
  const { data } = await api.put(`${base}/${id}`, rest, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return data;
}

export async function deleteInterviewRecording(id: string, tenantId?: string): Promise<string> {
  await api.delete(`${base}/${id}`, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined });
  return id;
}

import api from './api';
import type { SkillsAssessment } from '../types/skillsAssessment';

function tenantHeaders(tenantId?: string) {
  const headers: Record<string, string> = {};
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  return { headers };
}

export const skillsAssessmentService = {
  list: async (tenantId?: string) => {
    const resp = await api.get<SkillsAssessment[]>('/skills-assessments', tenantHeaders(tenantId));
    return resp.data;
  },
  get: async (id: string, tenantId?: string) => {
    const resp = await api.get<SkillsAssessment>(`/skills-assessments/${id}`, tenantHeaders(tenantId));
    return resp.data;
  },
  create: async (data: Partial<SkillsAssessment>, tenantId?: string) => {
    const resp = await api.post<SkillsAssessment>('/skills-assessments', data, tenantHeaders(tenantId));
    return resp.data;
  },
  update: async (id: string, data: Partial<SkillsAssessment>, tenantId?: string) => {
    const resp = await api.put<SkillsAssessment>(`/skills-assessments/${id}`, data, tenantHeaders(tenantId));
    return resp.data;
  },
  delete: async (id: string, tenantId?: string) => {
    await api.delete(`/skills-assessments/${id}`, tenantHeaders(tenantId));
    return id;
  },
};

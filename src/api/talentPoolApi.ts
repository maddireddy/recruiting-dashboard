import api from '../services/api';

export type TalentPool = {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  membersCount?: number;
  createdAt?: string;
};

export type TalentPoolMember = {
  id: string;
  candidateId: string;
  fullName: string;
  email?: string;
  status?: string;
};

export const talentPoolApi = {
  list: async (): Promise<TalentPool[]> => {
    const { data } = await api.get('/talent-pools');
    return data;
  },
  getById: async (id: string): Promise<TalentPool> => {
    const { data } = await api.get(`/talent-pools/${id}`);
    return data;
  },
  create: async (payload: Partial<TalentPool>): Promise<TalentPool> => {
    const { data } = await api.post('/talent-pools', payload);
    return data;
  },
  update: async (id: string, payload: Partial<TalentPool>): Promise<TalentPool> => {
    const { data } = await api.put(`/talent-pools/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/talent-pools/${id}`);
  },
  listMembers: async (id: string): Promise<TalentPoolMember[]> => {
    const { data } = await api.get(`/talent-pools/${id}/members`);
    return data;
  },
  addMember: async (id: string, candidateId: string): Promise<void> => {
    await api.post(`/talent-pools/${id}/members`, { candidateId });
  },
  removeMember: async (id: string, memberId: string): Promise<void> => {
    await api.delete(`/talent-pools/${id}/members/${memberId}`);
  },
};

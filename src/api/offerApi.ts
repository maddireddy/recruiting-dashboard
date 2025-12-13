import api from '../services/api';

export type Offer = {
  id: string;
  candidateId: string;
  jobId: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN' | 'APPROVED' | 'REJECTED';
  baseSalary?: number;
  bonus?: number;
  equity?: string;
  notes?: string;
  createdAt?: string;
};

export const offerApi = {
  list: async (): Promise<Offer[]> => {
    const { data } = await api.get('/offers');
    return data;
  },
  getById: async (id: string): Promise<Offer> => {
    const { data } = await api.get(`/offers/${id}`);
    return data;
  },
  create: async (payload: Partial<Offer>): Promise<Offer> => {
    const { data } = await api.post('/offers', payload);
    return data;
  },
  update: async (id: string, payload: Partial<Offer>): Promise<Offer> => {
    const { data } = await api.put(`/offers/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/offers/${id}`);
  },
};

import api from './api';
import type { Client } from '../types/client';

export const clientService = {
  getAll: (page = 0, size = 20) => api.get<{content: Client[]}>(`/clients?page=${page}&size=${size}`),
  getById: (id: string) => api.get<Client>(`/clients/${id}`),
  getByStatus: (status: string) => api.get<Client[]>(`/clients/status/${status}`),
  search: (name: string, page = 0, size = 20) =>
    api.get<{content: Client[]}>(`/clients/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`),
  create: (client: Partial<Client>) => api.post<Client>('/clients', client),
  update: (id: string, client: Partial<Client>) => api.put<Client>(`/clients/${id}`, client),
  delete: (id: string) => api.delete(`/clients/${id}`),
};
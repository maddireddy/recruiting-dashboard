import api from './api';

export interface CandidateSearchResult {
  id: string;
  name: string;
  email?: string;
  skills?: string[];
  location?: string;
  experienceYears?: number;
}

export const advancedSearchService = {
  searchCandidates: async (q: string, tenantId?: string) => {
    const headers: Record<string, string> = {};
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    const { data } = await api.get(`/search/candidates?q=${encodeURIComponent(q)}`, { headers });
    return data as CandidateSearchResult[];
  },
};

import { create } from 'zustand';

interface SearchFilters {
  keyword?: string;
  location?: string;
  skills?: string[];
}

interface SearchState {
  filters: SearchFilters;
  results: Array<{ id: string; text: string; score?: number }>;
  setFilter: (key: keyof SearchFilters, value: any) => void;
  setResults: (r: Array<{ id: string; text: string; score?: number }>) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: {},
  results: [],
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  setResults: (r) => set(() => ({ results: r })),
  reset: () => set(() => ({ filters: {}, results: [] })),
}));

import { create } from 'zustand';

export interface CandidateProfile {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: string;
}

interface CandidateState {
  candidates: CandidateProfile[];
  addCandidate: (c: CandidateProfile) => void;
  clear: () => void;
}

export const useCandidateStore = create<CandidateState>((set) => ({
  candidates: [],
  addCandidate: (c) => set((s) => ({ candidates: [...s.candidates, { id: crypto.randomUUID(), ...c }] })),
  clear: () => set({ candidates: [] }),
}));

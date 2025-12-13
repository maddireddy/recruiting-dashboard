import { create } from 'zustand';

type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'RECRUITER' | 'VIEWER' | string;
};

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('accessToken'),
  user: null,
  login: (userData) => set({ isAuthenticated: true, user: userData }),
  logout: () => {
    localStorage.clear();
    set({ isAuthenticated: false, user: null });
  },
}));

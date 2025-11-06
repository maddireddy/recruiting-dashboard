import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: unknown | null;
  login: (userData: unknown) => void;
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

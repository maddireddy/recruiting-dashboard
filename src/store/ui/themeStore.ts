import { create } from 'zustand';

interface ThemeState {
  dark: boolean;
  setDark: (v: boolean) => void;
  toggle: () => void;
}

const persisted = (() => {
  try { return JSON.parse(localStorage.getItem('ui.theme') || 'null'); } catch { return null; }
})();

export const useThemeStore = create<ThemeState>((set) => ({
  dark: Boolean(persisted?.dark),
  setDark: (v) => set(() => {
    try { localStorage.setItem('ui.theme', JSON.stringify({ dark: v })); } catch {}
    return { dark: v };
  }),
  toggle: () => set((s) => {
    const next = !s.dark;
    try { localStorage.setItem('ui.theme', JSON.stringify({ dark: next })); } catch {}
    return { dark: next };
  }),
}));

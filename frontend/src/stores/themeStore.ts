'use client';

import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
  hydrate: () => void;
}

const STORAGE_KEY = 'estetica-theme';

function applyTheme(t: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', t === 'dark');
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, next);
    set({ theme: next });
  },
  setTheme: (t) => {
    applyTheme(t);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, t);
    set({ theme: t });
  },
  hydrate: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme: Theme = stored ?? (prefersDark ? 'dark' : 'light');
    applyTheme(theme);
    set({ theme });
  },
}));

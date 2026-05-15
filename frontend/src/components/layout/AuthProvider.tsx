'use client';

import { useEffect } from 'react';
import { me } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const hydrateTheme = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrateTheme();
    me().then((user) => {
      if (user) setUser(user);
      // Se null (401), o interceptor em api.ts já redireciona para /login
    });
  }, [setUser, hydrateTheme]);

  return <>{children}</>;
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { me } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser      = useAuthStore((s) => s.setUser);
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const router       = useRouter();

  useEffect(() => {
    hydrateTheme();
    me().then((user) => {
      if (user) {
        setUser(user);
      } else {
        document.cookie = 'app_authed=; path=/; max-age=0';
        document.cookie = 'app_admin=; path=/; max-age=0';
        router.replace('/login');
      }
    });
  }, [setUser, hydrateTheme, router]);

  return <>{children}</>;
}

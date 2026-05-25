import { api, ensureCsrfCookie } from './api';
import type { User } from '@/types/api';

function setAuthedCookie() {
  document.cookie = 'app_authed=1; path=/; SameSite=Lax; max-age=604800';
}

function clearAuthedCookie() {
  document.cookie = 'app_authed=; path=/; max-age=0';
  document.cookie = 'app_admin=; path=/; max-age=0';
}

function setAdminCookie() {
  document.cookie = 'app_admin=1; path=/; SameSite=Lax; max-age=604800';
}

export async function login(email: string, password: string): Promise<User> {
  await ensureCsrfCookie();
  const { data } = await api.post('/api/login', { email, password });
  const user: User = data.data;
  setAuthedCookie();
  if (user.is_super_admin) {
    setAdminCookie();
  }
  return user;
}

export async function logout(): Promise<void> {
  await api.post('/api/logout');
  clearAuthedCookie();
}

export async function me(): Promise<User | null> {
  try {
    const { data } = await api.get('/api/me');
    return data.data;
  } catch {
    // Interceptor em api.ts já limpa o cookie e redireciona no 401
    return null;
  }
}

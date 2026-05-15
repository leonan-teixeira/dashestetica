import { api, ensureCsrfCookie } from './api';
import type { User } from '@/types/api';

function setAuthedCookie() {
  document.cookie = 'app_authed=1; path=/; SameSite=Lax; max-age=604800';
}

function clearAuthedCookie() {
  document.cookie = 'app_authed=; path=/; max-age=0';
}

export async function login(email: string, password: string): Promise<User> {
  await ensureCsrfCookie();
  const { data } = await api.post('/api/login', { email, password });
  setAuthedCookie();
  return data.data;
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

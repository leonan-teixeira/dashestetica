import axios, { AxiosError, type AxiosInstance } from 'axios';

export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status;

    if (status === 401 && typeof window !== 'undefined') {
      document.cookie = 'app_authed=; path=/; max-age=0';
      document.cookie = 'app_admin=; path=/; max-age=0';
      const isAuthPage = window.location.pathname.startsWith('/login');
      if (!isAuthPage) {
        window.location.href = '/login';
      }
    }

    if (status === 403 && typeof window !== 'undefined') {
      const data = err.response?.data as { code?: string } | undefined;
      if (data?.code === 'SUBSCRIPTION_EXPIRED') {
        window.location.href = '/assinatura-expirada';
      }
    }

    if (status === 419) {
      await ensureCsrfCookie();
    }

    return Promise.reject(err);
  }
);

export async function ensureCsrfCookie(): Promise<void> {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '');
  await api.get(`${base}/sanctum/csrf-cookie`);
}

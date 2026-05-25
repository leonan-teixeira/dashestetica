import { api } from './api';
import type { Clinica, PaginatedResponse } from '@/types/api';

export async function listClinicas(params?: {
  search?: string;
  ativo?: boolean;
  page?: number;
}): Promise<PaginatedResponse<Clinica>> {
  const { data } = await api.get('/admin/clinicas', { params });
  return data;
}

export async function getClinica(id: number): Promise<Clinica> {
  const { data } = await api.get(`/admin/clinicas/${id}`);
  return data.data;
}

export async function createClinica(payload: {
  nome: string;
  email_contato: string;
  telefone?: string;
  cnpj?: string;
  plano?: string;
  assinatura_inicio?: string;
  assinatura_fim?: string;
  usuario_nome: string;
  usuario_senha: string;
}): Promise<Clinica> {
  const { data } = await api.post('/admin/clinicas', payload);
  return data.data;
}

export async function updateClinica(
  id: number,
  payload: Partial<{
    nome: string;
    email_contato: string;
    telefone: string;
    cnpj: string;
    plano: string;
    assinatura_inicio: string;
    assinatura_fim: string;
    ativo: boolean;
  }>
): Promise<Clinica> {
  const { data } = await api.put(`/admin/clinicas/${id}`, payload);
  return data.data;
}

export async function desativarClinica(id: number): Promise<void> {
  await api.delete(`/admin/clinicas/${id}`);
}

export async function reativarClinica(id: number): Promise<Clinica> {
  const { data } = await api.patch(`/admin/clinicas/${id}/reativar`);
  return data.data;
}

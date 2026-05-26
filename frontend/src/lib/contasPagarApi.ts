import { api } from './api';
import type { ContaPagar, ContasPagarResumo, PaginatedResponse } from '@/types/api';

interface ListParams {
  status?: string;
  categoria?: string;
  data_inicio?: string;
  data_fim?: string;
  busca?: string;
  page?: number;
}

export async function getResumoContas(): Promise<ContasPagarResumo> {
  const { data } = await api.get('/contas-pagar/resumo');
  return data;
}

export async function listContas(params?: ListParams): Promise<{ data: ContaPagar[]; meta: Record<string, number> }> {
  const { data } = await api.get('/contas-pagar', { params });
  return data;
}

export async function createConta(payload: Partial<ContaPagar>): Promise<ContaPagar> {
  const { data } = await api.post('/contas-pagar', payload);
  return data.data;
}

export async function updateConta(id: number, payload: Partial<ContaPagar>): Promise<ContaPagar> {
  const { data } = await api.put(`/contas-pagar/${id}`, payload);
  return data.data;
}

export async function pagarConta(id: number, payload: { data_pagamento: string; forma_pagamento?: string | null }): Promise<ContaPagar> {
  const { data } = await api.patch(`/contas-pagar/${id}/pagar`, payload);
  return data.data;
}

export async function desfazerPagamento(id: number): Promise<ContaPagar> {
  const { data } = await api.patch(`/contas-pagar/${id}/desfazer-pagamento`);
  return data.data;
}

export async function deleteConta(id: number): Promise<void> {
  await api.delete(`/contas-pagar/${id}`);
}

export async function getCategoriasContas(): Promise<string[]> {
  const { data } = await api.get('/contas-pagar/categorias');
  return data;
}

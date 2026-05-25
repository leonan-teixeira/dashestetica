import { api } from './api';
import type { FinanceiroResumo, ExtratoItem, ExtratoMeta, FaturamentoMensal } from '@/types/api';

interface ExtratoParams {
  data_inicio?: string;
  data_fim?: string;
  forma_pagamento?: string;
  pago?: boolean | '';
  busca?: string;
  page?: number;
}

export async function getResumo(params?: { data_inicio?: string; data_fim?: string }): Promise<FinanceiroResumo> {
  const { data } = await api.get('/financeiro/resumo', { params });
  return data;
}

export async function getExtrato(params?: ExtratoParams): Promise<{ data: ExtratoItem[]; meta: ExtratoMeta }> {
  const { data } = await api.get('/financeiro/extrato', { params });
  return data;
}

export async function getFaturamentoMensal(): Promise<FaturamentoMensal[]> {
  const { data } = await api.get('/financeiro/faturamento-mensal');
  return data;
}

export async function marcarPago(id: number, payload: { pago: boolean; forma_pagamento?: string | null }): Promise<void> {
  await api.patch(`/financeiro/consultas/${id}/pago`, payload);
}

export function getExportUrl(params?: ExtratoParams): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';
  const qs = new URLSearchParams();
  if (params?.data_inicio) qs.set('data_inicio', params.data_inicio);
  if (params?.data_fim)    qs.set('data_fim',    params.data_fim);
  if (params?.forma_pagamento) qs.set('forma_pagamento', params.forma_pagamento);
  if (params?.pago !== undefined && params.pago !== '') qs.set('pago', String(params.pago));
  if (params?.busca) qs.set('busca', params.busca);
  return `${base}/financeiro/exportar-csv?${qs.toString()}`;
}

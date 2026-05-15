'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/types/api';

export type LembreteStatus = 'pendente' | 'enviado' | 'falhou' | 'cancelado';

export interface Lembrete {
  id: number;
  consulta_id: number | null;
  paciente_id: number;
  tipo: string;
  canal: string;
  status: LembreteStatus;
  agendado_para: string;
  enviado_em: string | null;
  tentativas: number;
  ultimo_erro: string | null;
  mensagem: string;
  paciente?: { nome_completo: string } | null;
}

export function useLembretes(params: { status?: LembreteStatus; paciente_id?: number } = {}) {
  return useQuery({
    queryKey: ['lembretes', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Lembrete>>('/api/lembretes', { params });
      return data;
    },
  });
}

export function useWhatsappStatus() {
  return useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: async () => {
      const { data } = await api.get<{ data: { configurado: boolean; instance: string | null } }>(
        '/api/lembretes/whatsapp/status'
      );
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function useReenviarLembrete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<{ data: Lembrete }>(`/api/lembretes/${id}/reenviar`);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lembretes'] }),
  });
}

export function useCancelarLembrete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/lembretes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lembretes'] }),
  });
}

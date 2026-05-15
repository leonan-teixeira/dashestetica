'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Consulta } from '@/types/consulta';
import type { PaginatedResponse } from '@/types/api';

interface ConsultaParams {
  paciente_id?: number;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
}

export function useConsultas(params: ConsultaParams = {}) {
  return useQuery({
    queryKey: ['consultas', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Consulta>>('/api/consultas', { params });
      return data;
    },
  });
}

export function useConsulta(id: number) {
  return useQuery({
    queryKey: ['consulta', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Consulta }>(`/api/consultas/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCriarConsulta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post<{ data: Consulta }>('/api/consultas', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consultas'] });
      qc.invalidateQueries({ queryKey: ['dashboard-resumo'] });
    },
  });
}

export function useAtualizarStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await api.patch<{ data: Consulta }>(`/api/consultas/${id}/status`, { status });
      return data.data;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['consultas'] });
      qc.invalidateQueries({ queryKey: ['consulta', id] });
      qc.invalidateQueries({ queryKey: ['dashboard-resumo'] });
    },
  });
}

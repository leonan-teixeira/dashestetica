'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Paciente } from '@/types/paciente';
import type { PaginatedResponse } from '@/types/api';

export function usePacientes(params: { search?: string; cpf_hash?: string; page?: number } = {}) {
  return useQuery({
    queryKey: ['pacientes', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Paciente>>('/pacientes', { params });
      return data;
    },
  });
}

export function usePaciente(id: number) {
  return useQuery({
    queryKey: ['paciente', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Paciente }>(`/pacientes/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCriarPaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post<{ data: Paciente }>('/pacientes', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacientes'] });
    },
  });
}

export function useAtualizarPaciente(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.put<{ data: Paciente }>(`/pacientes/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacientes'] });
      qc.invalidateQueries({ queryKey: ['paciente', id] });
    },
  });
}

export function useDeletarPaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/pacientes/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacientes'] });
    },
  });
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Anamnese } from '@/types/paciente';

export function useAnamnese(pacienteId: number) {
  return useQuery({
    queryKey: ['anamnese', pacienteId],
    queryFn: async () => {
      const { data } = await api.get<{ data: Anamnese }>(`/api/pacientes/${pacienteId}/anamnese`);
      return data.data;
    },
    enabled: !!pacienteId,
  });
}

export function useSalvarAnamnese(pacienteId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post<{ data: Anamnese }>(
        `/api/pacientes/${pacienteId}/anamnese`,
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['anamnese', pacienteId] });
      qc.invalidateQueries({ queryKey: ['paciente', pacienteId] });
    },
  });
}

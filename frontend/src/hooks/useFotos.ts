'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { FotoEvolucao } from '@/types/consulta';

export function useFotosPaciente(pacienteId: number) {
  return useQuery({
    queryKey: ['fotos', 'paciente', pacienteId],
    queryFn: async () => {
      const { data } = await api.get<{ data: FotoEvolucao[] }>(
        `/api/pacientes/${pacienteId}/fotos`
      );
      return data.data;
    },
    enabled: !!pacienteId,
  });
}

export function useComparativo(consultaId: number) {
  return useQuery({
    queryKey: ['fotos', 'comparativo', consultaId],
    queryFn: async () => {
      const { data } = await api.get<{ data: { antes: FotoEvolucao[]; depois: FotoEvolucao[] } }>(
        `/api/consultas/${consultaId}/comparativo`
      );
      return data.data;
    },
    enabled: !!consultaId,
  });
}

export function useUploadFoto(consultaId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, tipo, observacao }: { file: File; tipo: string; observacao?: string }) => {
      const form = new FormData();
      form.append('fotos[]', file);
      form.append('tipo', tipo);
      if (observacao) form.append('observacao', observacao);
      const { data } = await api.post<{ data: FotoEvolucao }>(
        `/api/consultas/${consultaId}/fotos`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data.data;
    },
    onSuccess: (foto) => {
      qc.invalidateQueries({ queryKey: ['fotos', 'paciente', foto.paciente_id] });
      qc.invalidateQueries({ queryKey: ['fotos', 'comparativo', consultaId] });
      qc.invalidateQueries({ queryKey: ['consulta', consultaId] });
    },
  });
}

export function useDeletarFoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/fotos/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fotos'] });
    },
  });
}

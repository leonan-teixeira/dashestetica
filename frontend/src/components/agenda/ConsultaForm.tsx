'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, X, Calendar, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import type { Procedimento } from '@/types/consulta';
import type { Paciente } from '@/types/paciente';

interface ConsultaPayload {
  paciente_id: number;
  inicio: string;
  fim: string;
  procedimentos: number[];
  observacoes?: string;
}

interface Props {
  defaultPacienteId?: number;
  defaultDate?: string;
  onSubmit: (data: ConsultaPayload) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
}

const inputCls =
  'w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15';

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function ConsultaForm({
  defaultPacienteId,
  defaultDate,
  onSubmit,
  loading,
  onCancel,
}: Props) {
  const [pacienteId, setPacienteId] = useState(defaultPacienteId ? String(defaultPacienteId) : '');
  const [pacienteSearch, setPacienteSearch] = useState('');
  const [inicio, setInicio] = useState(defaultDate ?? '');
  const [procedimentoIds, setProcedimentoIds] = useState<number[]>([]);
  const [observacoes, setObservacoes] = useState('');

  const { data: pacientes } = useQuery({
    queryKey: ['pacientes-busca', pacienteSearch],
    queryFn: async () => {
      const { data } = await api.get<{ data: Paciente[] }>('/pacientes', {
        params: { search: pacienteSearch || undefined, per_page: 10 },
      });
      return data.data;
    },
    enabled: pacienteSearch.length >= 2 || !!pacienteId,
  });

  const { data: procedimentos } = useQuery({
    queryKey: ['procedimentos'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Procedimento[] }>('/procedimentos');
      return data.data;
    },
  });

  function toggleProcedimento(id: number) {
    setProcedimentoIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  const procedimentosSelecionados = procedimentos?.filter((p) => procedimentoIds.includes(p.id)) ?? [];
  const duracaoTotal = procedimentosSelecionados.reduce((sum, p) => sum + p.duracao_minutos, 0);
  const valorTotal = procedimentosSelecionados.reduce((sum, p) => sum + Number(p.preco), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pacienteId || !inicio || procedimentoIds.length === 0) return;
    const inicioMs = new Date(inicio).getTime();
    const fim = new Date(inicioMs + duracaoTotal * 60_000).toISOString();
    await onSubmit({
      paciente_id: Number(pacienteId),
      inicio: new Date(inicio).toISOString(),
      fim,
      procedimentos: procedimentoIds,
      observacoes: observacoes || undefined,
    });
  }

  const pacienteSelecionado = pacientes?.find((p) => p.id === Number(pacienteId));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Paciente */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">Paciente *</label>
        {pacienteSelecionado ? (
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-700">
                {pacienteSelecionado.nome_completo.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground">
                {pacienteSelecionado.nome_completo}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPacienteId('');
                setPacienteSearch('');
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={pacienteSearch}
                onChange={(e) => setPacienteSearch(e.target.value)}
                placeholder="Digite o nome do paciente..."
                className={`${inputCls} pl-10`}
              />
            </div>
            {pacientes && pacientes.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                {pacientes.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPacienteId(String(p.id));
                      setPacienteSearch('');
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-700">
                      {p.nome_completo.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-foreground">{p.nome_completo}</p>
                      {p.telefone && <p className="text-xs text-muted-foreground">{p.telefone}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data e hora */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">Data e hora *</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="datetime-local"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className={`${inputCls} pl-10`}
            required
          />
        </div>
        {duracaoTotal > 0 && inicio && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Duração estimada: {duracaoTotal} min — término às{' '}
            <span className="font-medium text-foreground">
              {new Date(new Date(inicio).getTime() + duracaoTotal * 60_000).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </p>
        )}
      </div>

      {/* Procedimentos */}
      {procedimentos && procedimentos.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Procedimentos *</label>
          <div className="space-y-1.5 rounded-xl border border-border bg-card p-2">
            {procedimentos
              .filter((p) => p.ativo)
              .map((p) => {
                const checked = procedimentoIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors ${
                      checked ? 'bg-brand-soft' : 'hover:bg-muted/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleProcedimento(p.id)}
                      className="h-4 w-4 rounded border-border accent-[var(--brand-600)]"
                    />
                    <span className={`flex-1 text-sm ${checked ? 'font-semibold text-brand-700' : 'text-foreground'}`}>
                      {p.nome}
                    </span>
                    <span className="text-xs text-muted-foreground">{p.duracao_minutos}min</span>
                    <span className="text-xs font-medium text-foreground">{formatBRL(p.preco)}</span>
                  </label>
                );
              })}
          </div>
          {procedimentosSelecionados.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{formatBRL(valorTotal)}</span>
            </p>
          )}
        </div>
      )}

      {/* Observações */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">Observações</label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={2}
          placeholder="Opcional"
          className={inputCls}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !pacienteId || !inicio || procedimentoIds.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:shadow-lg disabled:opacity-40"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Agendando...' : 'Agendar consulta'}
        </button>
      </div>
    </form>
  );
}

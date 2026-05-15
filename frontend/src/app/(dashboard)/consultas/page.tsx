'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ChevronRight, FilterX, Stethoscope } from 'lucide-react';
import { useConsultas } from '@/hooks/useConsultas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusOptions = [
  { value: '',               label: 'Todos' },
  { value: 'agendada',       label: 'Agendada' },
  { value: 'confirmada',     label: 'Confirmada' },
  { value: 'realizada',      label: 'Realizada' },
  { value: 'cancelada',      label: 'Cancelada' },
  { value: 'nao_compareceu', label: 'Não compareceu' },
];

const statusCls: Record<string, string> = {
  agendada:       'bg-amber-100 text-amber-700',
  confirmada:     'bg-emerald-100 text-emerald-700',
  realizada:      'bg-sky-100 text-sky-700',
  cancelada:      'bg-rose-100 text-rose-700',
  nao_compareceu: 'bg-muted text-muted-foreground',
};

const inputCls =
  'rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15';

export default function ConsultasPage() {
  const [status, setStatus] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useConsultas({
    status: status || undefined,
    data_inicio: dataInicio || undefined,
    data_fim: dataFim || undefined,
    page,
  });

  function limpar() {
    setStatus('');
    setDataInicio('');
    setDataFim('');
    setPage(1);
  }

  const temFiltro = status || dataInicio || dataFim;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className={`${inputCls} w-full`}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              De
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => {
                setDataInicio(e.target.value);
                setPage(1);
              }}
              className={`${inputCls} w-full`}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Até
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => {
                setDataFim(e.target.value);
                setPage(1);
              }}
              className={`${inputCls} w-full`}
            />
          </div>
        </div>
        {temFiltro && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={limpar}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <FilterX className="h-3.5 w-3.5" />
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-600">
              <Stethoscope className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Nenhuma consulta encontrada</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {temFiltro ? 'Ajuste os filtros para ver outras consultas.' : 'Suas consultas aparecerão aqui.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.data.map((c) => (
              <Link
                key={c.id}
                href={`/consultas/${c.id}`}
                className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
              >
                <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-brand-soft text-brand-700">
                  <span className="text-xs font-semibold uppercase">
                    {format(new Date(c.inicio), 'MMM', { locale: ptBR })}
                  </span>
                  <span className="text-base font-bold leading-none">
                    {format(new Date(c.inicio), 'dd')}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {c.paciente?.nome_completo ?? 'Paciente'}
                  </p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(c.inicio), 'HH:mm')} – {format(new Date(c.fim), 'HH:mm')}
                    </span>
                    {c.procedimentos?.length ? (
                      <span className="truncate">{c.procedimentos.map((p) => p.nome).join(', ')}</span>
                    ) : null}
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusCls[c.status] ?? 'bg-muted text-muted-foreground'}`}>
                  {c.status.replace('_', ' ')}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Paginação */}
      {data && data.meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="px-2 text-sm text-muted-foreground">
            Página {page} de {data.meta.last_page}
          </span>
          <button
            disabled={page === data.meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

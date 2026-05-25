'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Banknote,
  FileText,
  CheckCircle,
  Images,
  Loader2,
  Stethoscope,
} from 'lucide-react';
import { toast } from 'sonner';
import { useConsulta, useAtualizarStatus } from '@/hooks/useConsultas';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ConsultaStatus } from '@/types/consulta';

const statusConfig: Record<ConsultaStatus, { label: string; cls: string; ring: string }> = {
  agendada:       { label: 'Agendada',       cls: 'bg-amber-100 text-amber-700',     ring: 'ring-amber-200' },
  confirmada:     { label: 'Confirmada',     cls: 'bg-emerald-100 text-emerald-700', ring: 'ring-emerald-200' },
  realizada:      { label: 'Realizada',      cls: 'bg-sky-100 text-sky-700',         ring: 'ring-sky-200' },
  cancelada:      { label: 'Cancelada',      cls: 'bg-rose-100 text-rose-700',       ring: 'ring-rose-200' },
  nao_compareceu: { label: 'Não compareceu', cls: 'bg-muted text-muted-foreground',  ring: 'ring-border' },
};

const acoesPorStatus: Record<ConsultaStatus, ConsultaStatus[]> = {
  agendada:       ['confirmada', 'cancelada', 'nao_compareceu'],
  confirmada:     ['realizada', 'cancelada', 'nao_compareceu'],
  realizada:      [],
  cancelada:      ['agendada'],
  nao_compareceu: ['agendada'],
};

const inputCls =
  'w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15';

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function ConsultaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const consultaId = Number(id);

  const { data: consulta, isLoading } = useConsulta(consultaId);
  const atualizarStatus = useAtualizarStatus();

  const [evolucao, setEvolucao] = useState('');
  const [savingEvolucao, setSavingEvolucao] = useState(false);

  async function handleStatus(status: ConsultaStatus) {
    try {
      await atualizarStatus.mutateAsync({ id: consultaId, status });
      toast.success('Status atualizado!');
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  }

  async function handleSalvarEvolucao() {
    if (!evolucao.trim()) return;
    setSavingEvolucao(true);
    try {
      await api.patch(`/consultas/${consultaId}/evolucao`, { evolucao_clinica: evolucao });
      toast.success('Evolução salva!');
      setEvolucao('');
    } catch {
      toast.error('Erro ao salvar evolução.');
    } finally {
      setSavingEvolucao(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!consulta) {
    return <p className="text-sm text-muted-foreground">Consulta não encontrada.</p>;
  }

  const s = statusConfig[consulta.status];
  const acoes = acoesPorStatus[consulta.status] ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/agenda"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para agenda
      </Link>

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="bg-brand-soft p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {consulta.paciente?.nome_completo ?? 'Paciente'}
              </p>
              <p className="mt-1 text-sm capitalize text-muted-foreground">
                {format(new Date(consulta.inicio), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${s.cls} ${s.ring}`}>
              {s.label}
            </span>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-brand-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Horário</p>
              <p className="text-sm font-medium text-foreground">
                {format(new Date(consulta.inicio), 'HH:mm')} – {format(new Date(consulta.fim), 'HH:mm')}
              </p>
            </div>
          </div>
          {consulta.valor_total != null && (
            <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-emerald-600">
                <Banknote className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Valor</p>
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {formatBRL(consulta.valor_total)}
                  {consulta.pago && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                </p>
              </div>
            </div>
          )}
        </div>

        {(consulta.procedimentos?.length || consulta.observacoes) && (
          <div className="space-y-3 border-t border-border p-5">
            {consulta.procedimentos?.length ? (
              <div>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Procedimentos
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {consulta.procedimentos.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-700"
                    >
                      {p.nome}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {consulta.observacoes && (
              <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3">
                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <p className="text-sm text-foreground">{consulta.observacoes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status actions */}
      {acoes.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">Atualizar status</p>
          <div className="flex flex-wrap gap-2">
            {acoes.map((acao) => (
              <button
                key={acao}
                onClick={() => handleStatus(acao)}
                disabled={atualizarStatus.isPending}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50 ${statusConfig[acao].cls}`}
              >
                {statusConfig[acao].label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Evolução clínica */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand-600">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Evolução clínica</h2>
            <p className="text-xs text-muted-foreground">Notas do atendimento</p>
          </div>
        </header>
        <div className="space-y-3 p-5">
          {consulta.evolucao_clinica && (
            <div className="whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-sm text-foreground">
              {consulta.evolucao_clinica}
            </div>
          )}
          <textarea
            value={evolucao}
            onChange={(e) => setEvolucao(e.target.value)}
            rows={3}
            placeholder={
              consulta.evolucao_clinica ? 'Adicionar nota...' : 'Registrar evolução clínica...'
            }
            className={inputCls}
          />
          <div className="flex justify-end">
            <button
              onClick={handleSalvarEvolucao}
              disabled={!evolucao.trim() || savingEvolucao}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:shadow-lg disabled:opacity-50"
            >
              {savingEvolucao && <Loader2 className="h-4 w-4 animate-spin" />}
              {savingEvolucao ? 'Salvando...' : 'Salvar evolução'}
            </button>
          </div>
        </div>
      </section>

      {/* Link fotos */}
      {consulta.paciente_id && (
        <Link
          href={`/pacientes/${consulta.paciente_id}/fotos`}
          className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand-600">
              <Images className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Fotos de evolução</p>
              <p className="text-xs text-muted-foreground">Galeria comparativa do paciente</p>
            </div>
          </div>
          <span className="text-xs font-medium text-primary">Abrir →</span>
        </Link>
      )}
    </div>
  );
}

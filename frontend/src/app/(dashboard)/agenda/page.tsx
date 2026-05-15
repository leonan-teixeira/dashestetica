'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, CalendarDays } from 'lucide-react';
import { useConsultas } from '@/hooks/useConsultas';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Calendario = dynamic(() => import('@/components/agenda/Calendario'), { ssr: false });

const STATUS_COLORS: Record<string, string> = {
  agendada: '#f59e0b',
  confirmada: '#10b981',
  realizada: '#0ea5e9',
  cancelada: '#ef4444',
  nao_compareceu: '#9ca3af',
};

const LEGENDA = [
  { label: 'Agendada',       color: STATUS_COLORS.agendada },
  { label: 'Confirmada',     color: STATUS_COLORS.confirmada },
  { label: 'Realizada',      color: STATUS_COLORS.realizada },
  { label: 'Cancelada',      color: STATUS_COLORS.cancelada },
];

export default function AgendaPage() {
  const [mes, setMes] = useState(() => new Date());

  const { data } = useConsultas({
    data_inicio: format(startOfMonth(mes), 'yyyy-MM-dd'),
    data_fim: format(endOfMonth(mes), 'yyyy-MM-dd'),
  });

  const eventos = (data?.data ?? []).map((c) => ({
    id: String(c.id),
    title: c.paciente?.nome_completo ?? 'Paciente',
    start: c.inicio,
    end: c.fim,
    color: STATUS_COLORS[c.status] ?? STATUS_COLORS.nao_compareceu,
    extendedProps: { consulta: c },
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-600">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Período
            </p>
            <p
              className="text-base font-semibold capitalize text-foreground"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {format(mes, 'MMMM yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>
        <Link
          href="/agenda/nova-consulta"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:shadow-lg active:translate-y-px"
        >
          <Plus className="h-4 w-4" />
          Nova consulta
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Legenda:</span>
        {LEGENDA.map(({ label, color }) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card p-4">
        <Calendario eventos={eventos} onMesChange={setMes} />
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Users, TrendingUp, Clock, ArrowRight, Sparkles } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

interface Resumo {
  consultas_hoje: number;
  faturamento_mes: number;
  total_pacientes: number;
  proximas_consultas: Array<{
    id: number;
    inicio: string;
    paciente?: { nome_completo: string };
    status: string;
  }>;
}

interface Graficos {
  faturamento_mensal: Array<{ mes: string; valor: number }>;
  consultas_por_status: Array<{ status: string; total: number }>;
  top_procedimentos: Array<{ nome: string; total: number }>;
}

const statusStyles: Record<string, string> = {
  agendada:       'bg-amber-100 text-amber-700',
  confirmada:     'bg-emerald-100 text-emerald-700',
  realizada:      'bg-sky-100 text-sky-700',
  cancelada:      'bg-rose-100 text-rose-700',
  nao_compareceu: 'bg-neutral-200 text-neutral-700',
};

const PIE_COLORS = ['#a855f7', '#ec4899', '#06b6d4', '#f59e0b', '#6b7280'];

function brl(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-resumo'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Resumo }>('/api/dashboard/resumo');
      return data.data;
    },
  });

  const { data: graficos } = useQuery({
    queryKey: ['dashboard-graficos'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Graficos }>('/api/dashboard/graficos');
      return data.data;
    },
  });

  const cards = [
    {
      label:  'Consultas hoje',
      value:  data?.consultas_hoje ?? 0,
      icon:   CalendarDays,
      hint:   'Atendimentos do dia',
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      label:  'Faturamento do mês',
      value:  brl(data?.faturamento_mes ?? 0),
      icon:   TrendingUp,
      hint:   'Consultas realizadas',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label:  'Total de pacientes',
      value:  data?.total_pacientes ?? 0,
      icon:   Users,
      hint:   'Cadastro ativo',
      iconBg: 'bg-violet-50 text-violet-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-white shadow-lg shadow-brand-500/20 sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 right-20 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Bem-vindo de volta
            </div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
              Tenha um ótimo dia de atendimentos
            </h2>
            <p className="mt-1 text-sm text-white/80">
              Acompanhe seus números e os próximos compromissos da sua agenda.
            </p>
          </div>
          <Link
            href="/agenda/nova-consulta"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition-all hover:bg-white/90 active:translate-y-px"
          >
            Nova consulta
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
            ))
          : cards.map(({ label, value, icon: Icon, hint, iconBg }) => (
              <div key={label} className="card-hover rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  {value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
              </div>
            ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Faturamento mensal — ocupa 2 colunas */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Faturamento mensal</h2>
          {graficos?.faturamento_mensal?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={graficos.faturamento_mensal} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  width={48}
                />
                <Tooltip
                  formatter={(v) => [brl(Number(v)), 'Faturamento']}
                  contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', fontSize: 12 }}
                />
                <Bar dataKey="valor" fill="url(#brandGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="brandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Nenhum dado disponível.
            </div>
          )}
        </div>

        {/* Consultas por status — 1 coluna */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Consultas por status</h2>
          {graficos?.consultas_por_status?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={graficos.consultas_por_status}
                  dataKey="total"
                  nameKey="status"
                  cx="50%"
                  cy="45%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={3}
                >
                  {graficos.consultas_por_status.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>}
                />
                <Tooltip
                  formatter={(v, name) => [v, name]}
                  contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Nenhum dado disponível.
            </div>
          )}
        </div>
      </div>

      {/* Top procedimentos */}
      {graficos?.top_procedimentos?.length ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Top 5 procedimentos</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={graficos.top_procedimentos}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="nome"
                width={140}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [v, 'Realizações']}
                contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', fontSize: 12 }}
              />
              <Bar dataKey="total" fill="#a855f7" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      {/* Próximas consultas */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Próximas consultas</h2>
            <p className="text-xs text-muted-foreground">5 próximas em sua agenda</p>
          </div>
          <Link href="/agenda" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            Ver agenda
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {!data?.proximas_consultas?.length && (
            <div className="px-5 py-12 text-center">
              <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhuma consulta agendada.</p>
            </div>
          )}
          {data?.proximas_consultas?.map((c) => (
            <Link
              key={c.id}
              href={`/consultas/${c.id}`}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-700">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {c.paciente?.nome_completo ?? 'Paciente'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(c.inicio), "EEEE, dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusStyles[c.status] ?? 'bg-muted text-muted-foreground'}`}>
                {c.status.replace('_', ' ')}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

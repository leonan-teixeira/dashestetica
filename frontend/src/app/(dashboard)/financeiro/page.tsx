'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Download,
  RefreshCw,
  Search,
  ChevronUp,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  getResumo,
  getExtrato,
  getFaturamentoMensal,
  marcarPago,
  getExportUrl,
} from '@/lib/financeiroApi';
import type { FinanceiroResumo, ExtratoItem, ExtratoMeta, FaturamentoMensal } from '@/types/api';
import { cn } from '@/lib/utils';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dtFmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const FORMAS: Record<string, string> = {
  pix:              'Pix',
  credito:          'Cartão Crédito',
  debito:           'Cartão Débito',
  dinheiro:         'Dinheiro',
  outro:            'Outro',
  nao_informado:    '—',
};

function hoje() {
  return new Date().toISOString().slice(0, 10);
}
function inicioMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  variacao,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent: 'green' | 'blue' | 'yellow' | 'red';
  variacao?: number | null;
}) {
  const colors = {
    green:  'bg-emerald-500/10 text-emerald-500',
    blue:   'bg-brand-500/10 text-brand-500',
    yellow: 'bg-amber-500/10 text-amber-500',
    red:    'bg-red-500/10 text-red-500',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl', colors[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        {variacao !== undefined && variacao !== null && (
          <span className={cn(
            'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
            variacao >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
          )}>
            {variacao >= 0 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {Math.abs(variacao)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground/70">{sub}</p>}
      </div>
    </div>
  );
}

type Tab = 'visao-geral' | 'extrato' | 'contas-receber';

export default function FinanceiroPage() {
  const [tab, setTab] = useState<Tab>('visao-geral');

  // Filtros
  const [dataInicio, setDataInicio] = useState(inicioMes());
  const [dataFim, setDataFim]       = useState(hoje());
  const [filtroForma, setFiltroForma] = useState('');
  const [filtroPago, setFiltroPago]   = useState<boolean | ''>('');
  const [busca, setBusca]             = useState('');
  const [page, setPage]               = useState(1);

  // Dados
  const [resumo, setResumo]         = useState<FinanceiroResumo | null>(null);
  const [mensal, setMensal]         = useState<FaturamentoMensal[]>([]);
  const [extrato, setExtrato]       = useState<ExtratoItem[]>([]);
  const [meta, setMeta]             = useState<ExtratoMeta | null>(null);
  const [loadingResumo, setLoadingResumo] = useState(true);
  const [loadingExtrato, setLoadingExtrato] = useState(false);

  const params = {
    data_inicio:     dataInicio,
    data_fim:        dataFim,
    forma_pagamento: filtroForma || undefined,
    pago:            filtroPago,
    busca:           busca || undefined,
    page,
  };

  const carregarResumo = useCallback(async () => {
    setLoadingResumo(true);
    try {
      const [r, m] = await Promise.all([
        getResumo({ data_inicio: dataInicio, data_fim: dataFim }),
        getFaturamentoMensal(),
      ]);
      setResumo(r);
      setMensal(m);
    } finally {
      setLoadingResumo(false);
    }
  }, [dataInicio, dataFim]);

  const carregarExtrato = useCallback(async () => {
    setLoadingExtrato(true);
    try {
      const res = await getExtrato(params);
      setExtrato(res.data);
      setMeta(res.meta);
    } finally {
      setLoadingExtrato(false);
    }
  }, [dataInicio, dataFim, filtroForma, filtroPago, busca, page]); // eslint-disable-line

  useEffect(() => { carregarResumo(); }, [carregarResumo]);

  useEffect(() => {
    if (tab === 'extrato' || tab === 'contas-receber') {
      carregarExtrato();
    }
  }, [tab, carregarExtrato]);

  async function handleMarcarPago(item: ExtratoItem, pago: boolean) {
    await marcarPago(item.id, { pago, forma_pagamento: item.forma_pagamento });
    carregarExtrato();
    carregarResumo();
  }

  const mesesFmt = mensal.map((m) => {
    const [ano, mes] = m.mes.split('-');
    const d = new Date(Number(ano), Number(mes) - 1);
    return {
      ...m,
      label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    };
  });

  const contasReceber = extrato.filter((i) => !i.pago);
  const extratoFiltrado = tab === 'contas-receber' ? contasReceber : extrato;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Financeiro</h2>
          {resumo && (
            <p className="text-sm text-muted-foreground">
              {new Date(dataInicio).toLocaleDateString('pt-BR')} – {new Date(dataFim).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => { setDataInicio(e.target.value); setPage(1); }}
            className="input h-9 text-sm w-36"
          />
          <span className="text-muted-foreground text-sm">até</span>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => { setDataFim(e.target.value); setPage(1); }}
            className="input h-9 text-sm w-36"
          />
          <a
            href={getExportUrl(params)}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary flex items-center gap-2 text-sm h-9"
          >
            <Download className="h-4 w-4" />
            CSV
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { key: 'visao-geral',    label: 'Visão Geral' },
          { key: 'extrato',        label: 'Extrato' },
          { key: 'contas-receber', label: `Contas a Receber${resumo ? ` (${resumo.qtd_pendente_geral})` : ''}` },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setPage(1); }}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
              tab === key
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Visão Geral ───────────────────────────────────────────────────── */}
      {tab === 'visao-geral' && (
        <div className="space-y-6">
          {loadingResumo ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Carregando...
            </div>
          ) : resumo ? (
            <>
              {/* Cards */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                  icon={TrendingUp}
                  label="Faturado no período"
                  value={fmt.format(resumo.faturado)}
                  accent="blue"
                  variacao={resumo.variacao_mes}
                  sub="vs. mês anterior"
                />
                <StatCard
                  icon={CheckCircle}
                  label="Recebido"
                  value={fmt.format(resumo.recebido)}
                  accent="green"
                  sub={resumo.faturado > 0 ? `${Math.round((resumo.recebido / resumo.faturado) * 100)}% do faturado` : undefined}
                />
                <StatCard
                  icon={Clock}
                  label="Pendente no período"
                  value={fmt.format(resumo.pendente_periodo)}
                  accent="yellow"
                />
                <StatCard
                  icon={AlertCircle}
                  label="Total a receber (geral)"
                  value={fmt.format(resumo.total_pendente_geral)}
                  accent="red"
                  sub={`${resumo.qtd_pendente_geral} consulta${resumo.qtd_pendente_geral !== 1 ? 's' : ''}`}
                />
              </div>

              {/* Por forma de pagamento */}
              {resumo.por_forma.length > 0 && (
                <div className="card p-5">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">Por forma de pagamento</h3>
                  <div className="flex flex-wrap gap-3">
                    {resumo.por_forma.map((f) => (
                      <div key={f.forma} className="flex flex-1 min-w-[120px] flex-col gap-1 rounded-xl bg-muted px-4 py-3">
                        <span className="text-xs text-muted-foreground">{FORMAS[f.forma] ?? f.forma}</span>
                        <span className="text-lg font-semibold text-foreground">{fmt.format(f.total)}</span>
                        <span className="text-xs text-muted-foreground">{f.qtd} consulta{f.qtd !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gráfico faturamento mensal */}
              {mesesFmt.length > 0 && (
                <div className="card p-5">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">Faturamento — últimos 12 meses</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={mesesFmt} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(v) => `R$${(Number(v) / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={55} />
                      <Tooltip
                        formatter={(v) => fmt.format(Number(v))}
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="total"    name="Faturado"  fill="hsl(var(--brand-500,217 91% 60%))"  radius={[4,4,0,0]} />
                      <Bar dataKey="recebido" name="Recebido"  fill="#10b981" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* ── Extrato / Contas a receber ────────────────────────────────────── */}
      {(tab === 'extrato' || tab === 'contas-receber') && (
        <div className="space-y-4">
          {/* Filtros da tabela */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPage(1); }}
                className="input pl-9 h-9 text-sm w-full"
              />
            </div>

            {tab === 'extrato' && (
              <>
                <select
                  value={filtroForma}
                  onChange={(e) => { setFiltroForma(e.target.value); setPage(1); }}
                  className="input h-9 text-sm"
                >
                  <option value="">Todas as formas</option>
                  {Object.entries(FORMAS).filter(([k]) => k !== 'nao_informado').map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>

                <select
                  value={filtroPago === '' ? '' : String(filtroPago)}
                  onChange={(e) => {
                    setFiltroPago(e.target.value === '' ? '' : e.target.value === 'true');
                    setPage(1);
                  }}
                  className="input h-9 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="true">Pago</option>
                  <option value="false">Pendente</option>
                </select>
              </>
            )}
          </div>

          {/* Totalizadores */}
          {meta && (
            <div className="flex flex-wrap gap-4 rounded-xl bg-muted px-4 py-3 text-sm">
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{meta.total}</span> consultas
              </span>
              <span className="text-muted-foreground">
                Total: <span className="font-semibold text-foreground">{fmt.format(meta.soma_filtro)}</span>
              </span>
              <span className="text-muted-foreground">
                Recebido: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fmt.format(meta.soma_recebido)}</span>
              </span>
              <span className="text-muted-foreground">
                Pendente: <span className="font-semibold text-amber-500">{fmt.format(meta.soma_filtro - meta.soma_recebido)}</span>
              </span>
            </div>
          )}

          {/* Tabela */}
          <div className="card overflow-hidden">
            {loadingExtrato ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Carregando...
              </div>
            ) : extratoFiltrado.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
                Nenhum registro encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paciente</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valor</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Pagamento</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {extratoFiltrado.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {dtFmt.format(new Date(item.data))}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {item.paciente ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">
                          {fmt.format(item.valor_total)}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground hidden sm:table-cell">
                          {FORMAS[item.forma_pagamento ?? 'nao_informado'] ?? item.forma_pagamento ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            item.pago
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          )}>
                            {item.pago ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!item.pago ? (
                            <button
                              onClick={() => handleMarcarPago(item, true)}
                              className="rounded-lg px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            >
                              Marcar pago
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarcarPago(item, false)}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                            >
                              Desfazer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Paginação */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-sm text-muted-foreground">{page} / {meta.last_page}</span>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

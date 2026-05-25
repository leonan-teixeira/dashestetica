'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  BarChart3,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { listProdutos, toggleAtivoProduto, getRelatorio } from '@/lib/estoqueApi';
import type { Produto, RelatorioEstoque } from '@/types/api';
import { ProdutoModal } from '@/components/estoque/ProdutoModal';
import { MovimentacaoModal } from '@/components/estoque/MovimentacaoModal';
import { MovimentacoesDrawer } from '@/components/estoque/MovimentacoesDrawer';
import { cn } from '@/lib/utils';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function StatCard({ icon: Icon, label, value, accent }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: 'green' | 'red' | 'yellow' | 'blue';
}) {
  const colors = {
    green:  'bg-emerald-500/10 text-emerald-500',
    red:    'bg-red-500/10 text-red-500',
    yellow: 'bg-amber-500/10 text-amber-500',
    blue:   'bg-brand-500/10 text-brand-500',
  };
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colors[accent ?? 'blue'])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioEstoque | null>(null);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativos' | 'inativos'>('ativos');
  const [showAlertas, setShowAlertas] = useState(true);

  const [produtoModal, setProdutoModal] = useState<{ open: boolean; produto?: Produto }>({ open: false });
  const [movModal, setMovModal] = useState<{ open: boolean; produto?: Produto }>({ open: false });
  const [histDrawer, setHistDrawer] = useState<{ open: boolean; produto?: Produto }>({ open: false });

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const carregarProdutos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listProdutos({
        busca: busca || undefined,
        ativo: filtroAtivo === 'ativos' ? true : filtroAtivo === 'inativos' ? false : '',
        page,
      });
      setProdutos(res.data);
      setLastPage(res.meta.last_page);
      setTotal(res.meta.total);
    } finally {
      setLoading(false);
    }
  }, [busca, filtroAtivo, page]);

  const carregarRelatorio = useCallback(async () => {
    try {
      const rel = await getRelatorio();
      setRelatorio(rel);
    } catch {
      // silencia
    }
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  useEffect(() => {
    carregarRelatorio();
  }, [carregarRelatorio]);

  async function handleToggleAtivo(produto: Produto) {
    await toggleAtivoProduto(produto.id);
    carregarProdutos();
    carregarRelatorio();
  }

  function onSaved() {
    setProdutoModal({ open: false });
    setMovModal({ open: false });
    carregarProdutos();
    carregarRelatorio();
  }

  const alertas = (relatorio?.itens ?? []).filter((i) => i.ativo && i.estoque_baixo);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Controle de Estoque</h2>
          <p className="text-sm text-muted-foreground">{total} produto{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setHistDrawer({ open: true })}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <BarChart3 className="h-4 w-4" />
            Movimentações
          </button>
          <button
            onClick={() => setProdutoModal({ open: true })}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Stats */}
      {relatorio && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Package}       label="Produtos ativos"    value={relatorio.totais.produtos_ativos}    accent="blue"   />
          <StatCard icon={AlertTriangle} label="Alertas de estoque"  value={relatorio.totais.alertas_estoque}    accent={relatorio.totais.alertas_estoque > 0 ? 'red' : 'green'}   />
          <StatCard icon={TrendingDown}  label="Inativos"            value={relatorio.totais.produtos_inativos}  accent="yellow" />
          <StatCard icon={TrendingUp}    label="Valor em estoque"    value={fmt.format(relatorio.totais.valor_total_estoque)} accent="green" />
        </div>
      )}

      {/* Alertas de estoque baixo */}
      {alertas.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <button
            onClick={() => setShowAlertas((v) => !v)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium text-sm">
                {alertas.length} {alertas.length === 1 ? 'produto abaixo' : 'produtos abaixo'} do estoque mínimo
              </span>
            </div>
            {showAlertas ? <ChevronUp className="h-4 w-4 text-amber-500" /> : <ChevronDown className="h-4 w-4 text-amber-500" />}
          </button>

          {showAlertas && (
            <div className="mt-3 space-y-2">
              {alertas.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-amber-500/10 px-3 py-2">
                  <span className="text-sm font-medium text-foreground">{item.nome}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      Mín: {item.estoque_minimo} {item.unidade}
                    </span>
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-500">
                      {item.estoque_atual} {item.unidade}
                    </span>
                    <button
                      onClick={() => setMovModal({ open: true, produto: produtos.find((p) => p.id === item.id) })}
                      className="rounded-lg bg-amber-500 px-2 py-0.5 text-xs font-medium text-white hover:bg-amber-600"
                    >
                      Repor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPage(1); }}
            className="input pl-9 h-9 text-sm w-full"
          />
        </div>

        <div className="flex rounded-xl border border-border overflow-hidden">
          {(['ativos', 'todos', 'inativos'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => { setFiltroAtivo(opt); setPage(1); }}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                filtroAtivo === opt
                  ? 'bg-brand-500 text-white'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {opt === 'ativos' ? 'Ativos' : opt === 'todos' ? 'Todos' : 'Inativos'}
            </button>
          ))}
        </div>

        <button
          onClick={() => { carregarProdutos(); carregarRelatorio(); }}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted"
          title="Atualizar"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            Carregando...
          </div>
        ) : produtos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Produto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Categoria</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estoque</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Mínimo</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {produtos.map((p) => (
                  <tr key={p.id} className={cn('transition-colors hover:bg-muted/40', !p.ativo && 'opacity-50')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.ativo && p.estoque_baixo && (
                          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" title="Estoque baixo" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">{p.nome}</p>
                          {p.descricao && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{p.descricao}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                      {p.categoria ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn(
                        'font-semibold',
                        p.ativo && p.estoque_baixo ? 'text-red-500' : 'text-foreground'
                      )}>
                        {p.estoque_atual}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">{p.unidade}</span>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell text-muted-foreground">
                      {p.estoque_minimo} {p.unidade}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        p.ativo
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {p.ativo && (
                          <button
                            onClick={() => setMovModal({ open: true, produto: p })}
                            className="rounded-lg px-2 py-1 text-xs font-medium bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 transition-colors"
                          >
                            Mov.
                          </button>
                        )}
                        <button
                          onClick={() => setHistDrawer({ open: true, produto: p })}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                        >
                          Hist.
                        </button>
                        <button
                          onClick={() => setProdutoModal({ open: true, produto: p })}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleAtivo(p)}
                          className={cn(
                            'rounded-lg px-2 py-1 text-xs font-medium transition-colors',
                            p.ativo
                              ? 'text-red-500 hover:bg-red-500/10'
                              : 'text-emerald-500 hover:bg-emerald-500/10'
                          )}
                        >
                          {p.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-muted-foreground">
            {page} / {lastPage}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Modals / Drawers */}
      <ProdutoModal
        open={produtoModal.open}
        produto={produtoModal.produto}
        onClose={() => setProdutoModal({ open: false })}
        onSaved={onSaved}
      />

      <MovimentacaoModal
        open={movModal.open}
        produto={movModal.produto}
        onClose={() => setMovModal({ open: false })}
        onSaved={onSaved}
      />

      <MovimentacoesDrawer
        open={histDrawer.open}
        produto={histDrawer.produto}
        onClose={() => setHistDrawer({ open: false })}
      />
    </div>
  );
}

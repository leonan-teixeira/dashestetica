'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { listMovimentacoes } from '@/lib/estoqueApi';
import type { MovimentacaoEstoque, Produto } from '@/types/api';
import { cn } from '@/lib/utils';

const fmt    = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dtFmt  = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

interface Props {
  open: boolean;
  produto?: Produto;
  onClose: () => void;
}

export function MovimentacoesDrawer({ open, produto, onClose }: Props) {
  const [movs, setMovs] = useState<MovimentacaoEstoque[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos');

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listMovimentacoes({
        produto_id: produto?.id,
        tipo:       filtroTipo !== 'todos' ? filtroTipo : undefined,
        page,
      });
      setMovs(res.data);
      setLastPage(res.meta.last_page);
    } finally {
      setLoading(false);
    }
  }, [produto?.id, filtroTipo, page]);

  useEffect(() => {
    if (open) {
      setPage(1);
      setFiltroTipo('todos');
    }
  }, [open, produto?.id]);

  useEffect(() => {
    if (open) carregar();
  }, [open, carregar]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-card shadow-xl border-l border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Histórico de Movimentações</h2>
            {produto && (
              <p className="text-xs text-muted-foreground">{produto.nome} — estoque atual: {produto.estoque_atual} {produto.unidade}</p>
            )}
            {!produto && <p className="text-xs text-muted-foreground">Todos os produtos</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 border-b border-border px-5 py-3">
          {(['todos', 'entrada', 'saida'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setFiltroTipo(t); setPage(1); }}
              className={cn(
                'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                filtroTipo === t
                  ? 'bg-brand-500 text-white'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {t === 'todos' ? 'Todos' : t === 'entrada' ? 'Entradas' : 'Saídas'}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              Carregando...
            </div>
          ) : movs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
              Nenhuma movimentação encontrada.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {movs.map((m) => (
                <div key={m.id} className="flex items-start gap-3 px-5 py-3">
                  <div className={cn(
                    'mt-0.5 flex-shrink-0 rounded-full p-1',
                    m.tipo === 'entrada'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-red-500/10 text-red-500'
                  )}>
                    {m.tipo === 'entrada'
                      ? <ArrowDownCircle className="h-4 w-4" />
                      : <ArrowUpCircle className="h-4 w-4" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {m.tipo === 'entrada' ? '+' : '−'}{m.quantidade} {m.produto?.unidade ?? ''}
                        {!produto && m.produto && (
                          <span className="ml-2 text-xs text-muted-foreground">{m.produto.nome}</span>
                        )}
                      </span>
                      {m.valor_total !== null && (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                          {fmt.format(m.valor_total)}
                        </span>
                      )}
                    </div>

                    {m.motivo && (
                      <p className="text-xs text-muted-foreground truncate">{m.motivo}</p>
                    )}
                    {m.observacao && (
                      <p className="text-xs text-muted-foreground/70 truncate">{m.observacao}</p>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {dtFmt.format(new Date(m.created_at))}
                      </span>
                      {m.preco_unitario !== null && (
                        <span className="text-[10px] text-muted-foreground">
                          · {fmt.format(m.preco_unitario)}/un
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginação */}
        {lastPage > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-border px-5 py-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-sm text-muted-foreground">{page} / {lastPage}</span>
            <button
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
              className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </>
  );
}

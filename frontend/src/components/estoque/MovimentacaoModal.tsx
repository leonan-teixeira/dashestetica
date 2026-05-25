'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { createMovimentacao } from '@/lib/estoqueApi';
import type { Produto } from '@/types/api';
import { cn } from '@/lib/utils';

interface FormData {
  tipo: 'entrada' | 'saida';
  quantidade: number;
  preco_unitario: number | null;
  motivo: string;
  observacao: string;
}

interface Props {
  open: boolean;
  produto?: Produto;
  onClose: () => void;
  onSaved: () => void;
}

export function MovimentacaoModal({ open, produto, onClose, onSaved }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      tipo: 'entrada',
      quantidade: 1,
      preco_unitario: null,
      motivo: '',
      observacao: '',
    },
  });

  const tipo = watch('tipo');
  const quantidade = watch('quantidade') || 0;
  const precoUnitario = watch('preco_unitario') || 0;

  useEffect(() => {
    if (open) {
      reset({
        tipo: 'entrada',
        quantidade: 1,
        preco_unitario: null,
        motivo: '',
        observacao: '',
      });
    }
  }, [open, reset]);

  async function onSubmit(data: FormData) {
    if (!produto) return;

    await createMovimentacao({
      produto_id:     produto.id,
      tipo:           data.tipo,
      quantidade:     data.quantidade,
      preco_unitario: data.tipo === 'entrada' ? (data.preco_unitario || null) : null,
      motivo:         data.motivo || null,
      observacao:     data.observacao || null,
    });

    onSaved();
  }

  if (!open || !produto) return null;

  const valorTotal = quantidade > 0 && precoUnitario > 0
    ? (quantidade * precoUnitario).toFixed(2).replace('.', ',')
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Registrar Movimentação</h2>
            <p className="text-xs text-muted-foreground">{produto.nome} — estoque atual: {produto.estoque_atual} {produto.unidade}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
          {/* Tipo */}
          <div className="grid grid-cols-2 gap-2">
            {(['entrada', 'saida'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValue('tipo', t)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors',
                  tipo === t
                    ? t === 'entrada'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                    : 'border-border text-muted-foreground hover:bg-muted'
                )}
              >
                {t === 'entrada'
                  ? <ArrowDownCircle className="h-4 w-4" />
                  : <ArrowUpCircle className="h-4 w-4" />
                }
                {t === 'entrada' ? 'Entrada' : 'Saída'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Quantidade *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                {...register('quantidade', {
                  valueAsNumber: true,
                  required: 'Obrigatório',
                  min: { value: 0.01, message: 'Mín 0,01' },
                })}
                className="input"
              />
              {errors.quantidade && <p className="mt-1 text-xs text-destructive">{errors.quantidade.message}</p>}
            </div>

            {tipo === 'entrada' && (
              <div>
                <label className="label">Preço unitário</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('preco_unitario', { valueAsNumber: true, min: 0 })}
                  className="input"
                  placeholder="0,00"
                />
              </div>
            )}
          </div>

          {valorTotal && tipo === 'entrada' && (
            <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
              Valor total: <strong>R$ {valorTotal}</strong>
            </div>
          )}

          {tipo === 'saida' && produto.estoque_atual < (watch('quantidade') || 0) && (
            <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
              Quantidade maior que o estoque disponível ({produto.estoque_atual} {produto.unidade}).
            </div>
          )}

          <div>
            <label className="label">Motivo</label>
            <input
              {...register('motivo')}
              className="input"
              placeholder={tipo === 'entrada' ? 'Ex: Compra fornecedor' : 'Ex: Uso em consulta'}
            />
          </div>

          <div>
            <label className="label">Observação</label>
            <textarea
              {...register('observacao')}
              className="input min-h-[64px] resize-none"
              placeholder="Detalhes opcionais..."
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

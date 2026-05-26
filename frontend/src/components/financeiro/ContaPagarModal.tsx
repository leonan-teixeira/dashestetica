'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { createConta, updateConta } from '@/lib/contasPagarApi';
import type { ContaPagar } from '@/types/api';

interface FormData {
  descricao: string;
  fornecedor: string;
  categoria: string;
  valor: number;
  data_vencimento: string;
  observacao: string;
  recorrente: boolean;
  recorrencia: string;
}

interface Props {
  open: boolean;
  conta?: ContaPagar;
  onClose: () => void;
  onSaved: () => void;
}

export function ContaPagarModal({ open, conta, onClose, onSaved }: Props) {
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>();

  const recorrente = watch('recorrente');

  useEffect(() => {
    if (open) {
      reset({
        descricao:       conta?.descricao ?? '',
        fornecedor:      conta?.fornecedor ?? '',
        categoria:       conta?.categoria ?? '',
        valor:           conta?.valor ?? 0,
        data_vencimento: conta?.data_vencimento ?? '',
        observacao:      conta?.observacao ?? '',
        recorrente:      conta?.recorrente ?? false,
        recorrencia:     conta?.recorrencia ?? 'mensal',
      });
    }
  }, [open, conta, reset]);

  async function onSubmit(data: FormData) {
    const payload = {
      descricao:       data.descricao,
      fornecedor:      data.fornecedor || null,
      categoria:       data.categoria || null,
      valor:           data.valor,
      data_vencimento: data.data_vencimento,
      observacao:      data.observacao || null,
      recorrente:      data.recorrente,
      recorrencia:     data.recorrente ? data.recorrencia : null,
    };

    if (conta) {
      await updateConta(conta.id, payload);
    } else {
      await createConta(payload);
    }
    onSaved();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {conta ? 'Editar Conta' : 'Nova Conta a Pagar'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
          <div>
            <label className="label">Descrição *</label>
            <input {...register('descricao', { required: 'Obrigatório' })} className="input" placeholder="Ex: Aluguel do espaço" />
            {errors.descricao && <p className="mt-1 text-xs text-destructive">{errors.descricao.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Fornecedor</label>
              <input {...register('fornecedor')} className="input" placeholder="Ex: Locadora XYZ" />
            </div>
            <div>
              <label className="label">Categoria</label>
              <input {...register('categoria')} className="input" placeholder="Ex: Aluguel" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Valor *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                {...register('valor', { valueAsNumber: true, required: 'Obrigatório', min: 0.01 })}
                className="input"
                placeholder="0,00"
              />
              {errors.valor && <p className="mt-1 text-xs text-destructive">{errors.valor.message}</p>}
            </div>
            <div>
              <label className="label">Vencimento *</label>
              <input
                type="date"
                {...register('data_vencimento', { required: 'Obrigatório' })}
                className="input"
              />
              {errors.data_vencimento && <p className="mt-1 text-xs text-destructive">{errors.data_vencimento.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
            <input
              type="checkbox"
              id="recorrente"
              {...register('recorrente')}
              className="h-4 w-4 rounded accent-brand-500"
            />
            <label htmlFor="recorrente" className="text-sm text-foreground cursor-pointer select-none">
              Conta recorrente
            </label>
            {recorrente && (
              <select {...register('recorrencia')} className="ml-auto input w-auto h-8 text-xs py-1">
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
                <option value="anual">Anual</option>
              </select>
            )}
          </div>

          <div>
            <label className="label">Observação</label>
            <textarea {...register('observacao')} className="input min-h-[64px] resize-none" placeholder="Detalhes opcionais..." />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Salvando...' : conta ? 'Salvar' : 'Criar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

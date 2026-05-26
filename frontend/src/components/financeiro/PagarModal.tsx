'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { pagarConta } from '@/lib/contasPagarApi';
import type { ContaPagar } from '@/types/api';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface FormData {
  data_pagamento: string;
  forma_pagamento: string;
}

interface Props {
  open: boolean;
  conta?: ContaPagar;
  onClose: () => void;
  onSaved: () => void;
}

export function PagarModal({ open, conta, onClose, onSaved }: Props) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: { data_pagamento: new Date().toISOString().slice(0, 10), forma_pagamento: 'pix' },
  });

  useEffect(() => {
    if (open) reset({ data_pagamento: new Date().toISOString().slice(0, 10), forma_pagamento: 'pix' });
  }, [open, reset]);

  async function onSubmit(data: FormData) {
    if (!conta) return;
    await pagarConta(conta.id, {
      data_pagamento:  data.data_pagamento,
      forma_pagamento: data.forma_pagamento || null,
    });
    onSaved();
  }

  if (!open || !conta) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Registrar Pagamento</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
          <div className="rounded-xl bg-muted px-4 py-3">
            <p className="text-sm font-medium text-foreground">{conta.descricao}</p>
            <p className="text-xl font-bold text-foreground mt-1">{fmt.format(conta.valor)}</p>
            {conta.fornecedor && <p className="text-xs text-muted-foreground mt-0.5">{conta.fornecedor}</p>}
          </div>

          <div>
            <label className="label">Data do pagamento *</label>
            <input type="date" {...register('data_pagamento', { required: true })} className="input" />
          </div>

          <div>
            <label className="label">Forma de pagamento</label>
            <select {...register('forma_pagamento')} className="input">
              <option value="pix">Pix</option>
              <option value="transferencia">Transferência</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="debito">Cartão Débito</option>
              <option value="credito">Cartão Crédito</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          {conta.recorrente && (
            <div className="rounded-xl bg-brand-500/10 px-3 py-2 text-xs text-brand-500">
              Conta recorrente — próxima parcela será criada automaticamente.
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Registrando...' : 'Confirmar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

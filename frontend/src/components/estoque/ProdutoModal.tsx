'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { createProduto, updateProduto } from '@/lib/estoqueApi';
import type { Produto } from '@/types/api';

interface FormData {
  nome: string;
  descricao: string;
  categoria: string;
  unidade: string;
  estoque_minimo: number;
}

interface Props {
  open: boolean;
  produto?: Produto;
  onClose: () => void;
  onSaved: () => void;
}

export function ProdutoModal({ open, produto, onClose, onSaved }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      nome: '',
      descricao: '',
      categoria: '',
      unidade: 'un',
      estoque_minimo: 5,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        nome:           produto?.nome ?? '',
        descricao:      produto?.descricao ?? '',
        categoria:      produto?.categoria ?? '',
        unidade:        produto?.unidade ?? 'un',
        estoque_minimo: produto?.estoque_minimo ?? 5,
      });
    }
  }, [open, produto, reset]);

  async function onSubmit(data: FormData) {
    const payload = {
      nome:           data.nome,
      descricao:      data.descricao || null,
      categoria:      data.categoria || null,
      unidade:        data.unidade || 'un',
      estoque_minimo: data.estoque_minimo,
    };

    if (produto) {
      await updateProduto(produto.id, payload);
    } else {
      await createProduto(payload);
    }

    onSaved();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {produto ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
          <div>
            <label className="label">Nome *</label>
            <input
              {...register('nome', { required: 'Nome obrigatório' })}
              className="input"
              placeholder="Ex: Luva descartável"
            />
            {errors.nome && <p className="mt-1 text-xs text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Categoria</label>
              <input
                {...register('categoria')}
                className="input"
                placeholder="Ex: Descartáveis"
              />
            </div>
            <div>
              <label className="label">Unidade</label>
              <input
                {...register('unidade')}
                className="input"
                placeholder="un, cx, ml, kg..."
              />
            </div>
          </div>

          <div>
            <label className="label">Estoque mínimo</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('estoque_minimo', { valueAsNumber: true, min: 0 })}
              className="input"
            />
            <p className="mt-1 text-xs text-muted-foreground">Alerta é exibido quando estoque ficar abaixo desse valor.</p>
          </div>

          <div>
            <label className="label">Descrição</label>
            <textarea
              {...register('descricao')}
              className="input min-h-[80px] resize-none"
              placeholder="Detalhes opcionais..."
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Salvando...' : produto ? 'Salvar' : 'Criar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

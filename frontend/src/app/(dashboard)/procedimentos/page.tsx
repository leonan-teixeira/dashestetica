'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Procedimento } from '@/types/consulta';
import { Plus, Pencil, Trash2, Clock, Scissors, X } from 'lucide-react';

const schema = z.object({
  nome:            z.string().min(2, 'Nome obrigatório'),
  descricao:       z.string().optional(),
  duracao_minutos: z.number().int().min(5, 'Mínimo 5 min'),
  preco:           z.number().min(0, 'Preço inválido'),
  categoria:       z.string().optional(),
  ativo:           z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const inputCls =
  'w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15';

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function ProcedimentosPage() {
  const qc = useQueryClient();
  const [editando, setEditando] = useState<Procedimento | null>(null);
  const [criando, setCriando] = useState(false);

  const { data: procedimentos, isLoading } = useQuery({
    queryKey: ['procedimentos'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Procedimento[] }>('/api/procedimentos');
      return data.data;
    },
  });

  const criar = useMutation({
    mutationFn: (d: FormData) => api.post('/api/procedimentos', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['procedimentos'] });
      toast.success('Procedimento criado!');
      setCriando(false);
    },
    onError: () => toast.error('Erro ao criar procedimento.'),
  });

  const atualizar = useMutation({
    mutationFn: ({ id, ...d }: FormData & { id: number }) =>
      api.put(`/api/procedimentos/${id}`, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['procedimentos'] });
      toast.success('Salvo!');
      setEditando(null);
    },
    onError: () => toast.error('Erro ao salvar.'),
  });

  const deletar = useMutation({
    mutationFn: (id: number) => api.delete(`/api/procedimentos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['procedimentos'] });
      toast.success('Removido.');
    },
    onError: () => toast.error('Erro ao remover.'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  function abrirCriacao() {
    reset({ ativo: true });
    setEditando(null);
    setCriando(true);
  }

  function abrirEdicao(p: Procedimento) {
    reset({
      nome: p.nome,
      descricao: p.descricao ?? '',
      duracao_minutos: p.duracao_minutos,
      preco: p.preco,
      categoria: p.categoria ?? '',
      ativo: p.ativo,
    });
    setEditando(p);
    setCriando(false);
  }

  function fecharForm() {
    setCriando(false);
    setEditando(null);
  }

  function onSubmit(data: FormData) {
    if (editando) atualizar.mutate({ ...data, id: editando.id });
    else criar.mutate(data);
  }

  const showForm = criando || !!editando;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          onClick={abrirCriacao}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:shadow-lg hover:shadow-brand-500/30 active:translate-y-px"
        >
          <Plus className="h-4 w-4" />
          Novo procedimento
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-brand-200 bg-brand-soft p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-brand-700">
              {editando ? 'Editar procedimento' : 'Novo procedimento'}
            </h2>
            <button
              onClick={fecharForm}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-700 hover:bg-white/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <input {...register('nome')} placeholder="Nome do procedimento *" className={inputCls} />
              {errors.nome && <p className="mt-1 text-xs text-destructive">{errors.nome.message}</p>}
            </div>
            <div>
              <input
                {...register('duracao_minutos', { valueAsNumber: true })}
                type="number"
                placeholder="Duração (min) *"
                className={inputCls}
              />
              {errors.duracao_minutos && (
                <p className="mt-1 text-xs text-destructive">{errors.duracao_minutos.message}</p>
              )}
            </div>
            <div>
              <input
                {...register('preco', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="Preço (R$) *"
                className={inputCls}
              />
              {errors.preco && <p className="mt-1 text-xs text-destructive">{errors.preco.message}</p>}
            </div>
            <div>
              <input {...register('categoria')} placeholder="Categoria (ex.: Facial)" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <textarea {...register('descricao')} rows={2} placeholder="Descrição (opcional)" className={inputCls} />
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={fecharForm}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={criar.isPending || atualizar.isPending}
                className="rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:shadow-lg disabled:opacity-50"
              >
                {editando ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-muted/40" />
            ))}
          </div>
        ) : !procedimentos?.length ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-600">
              <Scissors className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Nenhum procedimento cadastrado</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cadastre seus serviços para usá-los nas consultas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {procedimentos.map((p) => (
              <div key={p.id} className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/40">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-600">
                  <Scissors className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{p.nome}</p>
                    {p.categoria && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {p.categoria}
                      </span>
                    )}
                    {!p.ativo && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        Inativo
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {p.duracao_minutos} min
                    </span>
                    <span className="font-medium text-foreground">{formatBRL(p.preco)}</span>
                  </div>
                </div>
                <button
                  onClick={() => abrirEdicao(p)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remover "${p.nome}"?`)) deletar.mutate(p.id);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

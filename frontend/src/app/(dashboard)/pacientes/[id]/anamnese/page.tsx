'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ClipboardList, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { usePaciente } from '@/hooks/usePacientes';
import { useAnamnese, useSalvarAnamnese } from '@/hooks/useAnamnese';

interface AnamneseForm {
  alergias: string;
  medicamentos_uso_continuo: string;
  condicoes_pre_existentes: string;
  objetivo_tratamento: string;
  observacoes: string;
  gestante: boolean;
  amamentando: boolean;
  usa_anticoncepcional: boolean;
  fumante: boolean;
  pratica_atividade_fisica: boolean;
}

const inputCls =
  'w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15';

export default function AnamnesePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const pacienteId = Number(id);

  const { data: paciente } = usePaciente(pacienteId);
  const { data: anamnese, isLoading } = useAnamnese(pacienteId);
  const salvar = useSalvarAnamnese(pacienteId);

  const { register, handleSubmit, reset } = useForm<AnamneseForm>({
    defaultValues: {
      alergias: '',
      medicamentos_uso_continuo: '',
      condicoes_pre_existentes: '',
      objetivo_tratamento: '',
      observacoes: '',
      gestante: false,
      amamentando: false,
      usa_anticoncepcional: false,
      fumante: false,
      pratica_atividade_fisica: false,
    },
  });

  useEffect(() => {
    if (anamnese) {
      reset({
        alergias: anamnese.alergias ?? '',
        medicamentos_uso_continuo: anamnese.medicamentos_uso_continuo ?? '',
        condicoes_pre_existentes: anamnese.condicoes_pre_existentes ?? '',
        objetivo_tratamento: anamnese.objetivo_tratamento ?? '',
        observacoes: anamnese.observacoes ?? '',
        gestante: anamnese.gestante,
        amamentando: anamnese.amamentando,
        usa_anticoncepcional: anamnese.usa_anticoncepcional,
        fumante: anamnese.fumante,
        pratica_atividade_fisica: anamnese.pratica_atividade_fisica,
      });
    }
  }, [anamnese, reset]);

  async function onSubmit(data: AnamneseForm) {
    try {
      await salvar.mutateAsync(data as unknown as Record<string, unknown>);
      toast.success('Anamnese salva!');
    } catch {
      toast.error('Erro ao salvar anamnese.');
    }
  }

  const checkboxes: { name: keyof AnamneseForm; label: string }[] = [
    { name: 'gestante', label: 'Gestante' },
    { name: 'amamentando', label: 'Amamentando' },
    { name: 'usa_anticoncepcional', label: 'Anticoncepcional' },
    { name: 'fumante', label: 'Fumante' },
    { name: 'pratica_atividade_fisica', label: 'Atividade física' },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/pacientes/${pacienteId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-600">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Anamnese
          </h1>
          {paciente && <p className="text-sm text-muted-foreground">{paciente.nome_completo}</p>}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <header className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Histórico de saúde</h2>
            </header>
            <div className="space-y-4 p-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Alergias</label>
                <textarea
                  {...register('alergias')}
                  rows={2}
                  placeholder="Ex.: penicilina, látex..."
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Medicamentos de uso contínuo
                </label>
                <textarea
                  {...register('medicamentos_uso_continuo')}
                  rows={2}
                  placeholder="Ex.: metformina 500mg, losartana..."
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Condições pré-existentes
                </label>
                <textarea
                  {...register('condicoes_pre_existentes')}
                  rows={2}
                  placeholder="Ex.: diabetes tipo 2, hipertensão..."
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {checkboxes.map(({ name, label }) => (
                  <label
                    key={name}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 transition-colors hover:bg-muted/40"
                  >
                    <input
                      type="checkbox"
                      {...register(name)}
                      className="h-4 w-4 rounded border-border accent-[var(--brand-600)]"
                    />
                    <span className="text-sm text-foreground">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <header className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Objetivos e observações</h2>
            </header>
            <div className="space-y-4 p-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Objetivo do tratamento
                </label>
                <textarea
                  {...register('objetivo_tratamento')}
                  rows={2}
                  placeholder="O que a paciente deseja alcançar..."
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Observações adicionais
                </label>
                <textarea {...register('observacoes')} rows={2} className={inputCls} />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={salvar.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:shadow-lg disabled:opacity-50"
            >
              {salvar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {salvar.isPending ? 'Salvando...' : 'Salvar anamnese'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

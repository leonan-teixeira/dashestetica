'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ShieldCheck } from 'lucide-react';
import { pacienteSchema, type PacienteFormData } from '@/lib/validations/paciente';

interface Props {
  defaultValues?: Partial<PacienteFormData>;
  onSubmit: (data: PacienteFormData) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  editMode?: boolean;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-muted disabled:opacity-60';

export function PacienteForm({
  defaultValues,
  onSubmit,
  loading,
  submitLabel = 'Salvar',
  editMode,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome completo *" error={errors.nome_completo?.message}>
          <input {...register('nome_completo')} className={inputCls} />
        </Field>

        <Field label="CPF *" error={errors.cpf?.message}>
          <input {...register('cpf')} placeholder="000.000.000-00" className={inputCls} />
        </Field>

        <Field label="Telefone / WhatsApp *" error={errors.telefone?.message}>
          <input {...register('telefone')} placeholder="(11) 90000-0000" className={inputCls} />
        </Field>

        <Field label="E-mail" error={errors.email?.message}>
          <input {...register('email')} type="email" placeholder="opcional" className={inputCls} />
        </Field>

        <Field label="Data de nascimento" error={errors.data_nascimento?.message}>
          <input {...register('data_nascimento')} type="date" className={inputCls} />
        </Field>
      </div>

      <Field label="Observações gerais" error={errors.observacoes_gerais?.message}>
        <textarea
          {...register('observacoes_gerais')}
          rows={3}
          placeholder="Notas internas sobre o paciente..."
          className={inputCls}
        />
      </Field>

      {!editMode && (
        <div className="rounded-xl border border-brand-200 bg-brand-soft p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              {...register('consentimento_aceito')}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary accent-[var(--brand-600)]"
            />
            <div className="text-sm text-foreground">
              <p className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                Termo de consentimento (LGPD)
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Confirmo que o paciente leu e aceitou o termo de consentimento para coleta e
                tratamento de dados pessoais.
              </p>
            </div>
          </label>
          {errors.consentimento_aceito && (
            <p className="mt-2 text-xs text-destructive">{errors.consentimento_aceito.message}</p>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:shadow-lg disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

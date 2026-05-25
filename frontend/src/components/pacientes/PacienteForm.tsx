'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ShieldCheck, MapPin } from 'lucide-react';
import { pacienteSchema, type PacienteFormData } from '@/lib/validations/paciente';
import { api } from '@/lib/api';

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
  const [cepLoading, setCepLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues,
  });

  async function buscarCep() {
    const cep = watch('endereco.cep')?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) return;

    setCepLoading(true);
    try {
      const { data } = await api.get(`/cep/${cep}`);
      const d = data.data;
      setValue('endereco.rua', d.rua ?? '');
      setValue('endereco.bairro', d.bairro ?? '');
      setValue('endereco.cidade', d.cidade ?? '');
      setValue('endereco.uf', d.uf ?? '');
    } catch {
      // CEP não encontrado — mantém campos como estão
    } finally {
      setCepLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dados pessoais */}
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

      {/* Endereço */}
      <div className="rounded-xl border border-border bg-card/50 p-4 space-y-4">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MapPin className="h-4 w-4 text-brand-500" />
          Endereço
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">CEP</label>
            <div className="flex gap-2">
              <input
                {...register('endereco.cep')}
                placeholder="00000-000"
                maxLength={9}
                className={inputCls}
              />
              <button
                type="button"
                onClick={buscarCep}
                disabled={cepLoading}
                className="shrink-0 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
              >
                {cepLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Buscar'}
              </button>
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Rua / Logradouro</label>
            <input {...register('endereco.rua')} className={inputCls} />
          </div>

          <Field label="Número" error={undefined}>
            <input {...register('endereco.numero')} className={inputCls} />
          </Field>

          <Field label="Complemento" error={undefined}>
            <input {...register('endereco.complemento')} placeholder="Apto, bloco..." className={inputCls} />
          </Field>

          <Field label="Bairro" error={undefined}>
            <input {...register('endereco.bairro')} className={inputCls} />
          </Field>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Cidade</label>
            <input {...register('endereco.cidade')} className={inputCls} />
          </div>

          <Field label="UF" error={undefined}>
            <input {...register('endereco.uf')} maxLength={2} className={inputCls} />
          </Field>
        </div>
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

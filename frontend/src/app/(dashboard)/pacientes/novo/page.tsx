'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PacienteForm } from '@/components/pacientes/PacienteForm';
import { useCriarPaciente } from '@/hooks/usePacientes';
import type { PacienteFormData } from '@/lib/validations/paciente';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NovoPacientePage() {
  const router = useRouter();
  const criar = useCriarPaciente();

  async function handleSubmit(data: PacienteFormData) {
    try {
      const paciente = await criar.mutateAsync({
        ...data,
        consentimento_versao: '1.0',
      });
      toast.success('Paciente cadastrado com sucesso!');
      router.push(`/pacientes/${paciente.id}`);
    } catch {
      toast.error('Erro ao cadastrar paciente.');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/pacientes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para pacientes
      </Link>

      <div>
        <h1
          className="text-2xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Novo paciente
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha os dados pessoais e o consentimento LGPD.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <PacienteForm
          onSubmit={handleSubmit}
          loading={criar.isPending}
          submitLabel="Cadastrar paciente"
        />
      </div>
    </div>
  );
}

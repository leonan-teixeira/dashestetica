'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { usePaciente, useAtualizarPaciente } from '@/hooks/usePacientes';
import { PacienteForm } from '@/components/pacientes/PacienteForm';
import type { PacienteFormData } from '@/lib/validations/paciente';

export default function EditarPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const pacienteId = Number(id);
  const router = useRouter();

  const { data: paciente, isLoading } = usePaciente(pacienteId);
  const atualizar = useAtualizarPaciente(pacienteId);

  async function onSubmit(data: PacienteFormData) {
    try {
      await atualizar.mutateAsync(data);
      toast.success('Paciente atualizado!');
      router.push(`/pacientes/${pacienteId}`);
    } catch {
      toast.error('Erro ao salvar paciente.');
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!paciente) {
    return <p className="text-sm text-muted-foreground">Paciente não encontrado.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/pacientes/${pacienteId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div>
        <h1
          className="text-2xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Editar paciente
        </h1>
        <p className="mt-1 truncate text-sm text-muted-foreground">{paciente.nome_completo}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <PacienteForm
          defaultValues={{
            nome_completo: paciente.nome_completo,
            cpf: paciente.cpf ?? '',
            data_nascimento: paciente.data_nascimento ?? '',
            telefone: paciente.telefone ?? '',
            email: paciente.email ?? '',
            observacoes_gerais: paciente.observacoes_gerais ?? '',
            consentimento_aceito: true,
          }}
          onSubmit={onSubmit}
          loading={atualizar.isPending}
          submitLabel="Salvar alterações"
          editMode
        />
      </div>
    </div>
  );
}

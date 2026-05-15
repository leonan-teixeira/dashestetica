'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useCriarConsulta } from '@/hooks/useConsultas';
import { ConsultaForm } from '@/components/agenda/ConsultaForm';

export default function NovaConsultaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pacienteId = searchParams.get('paciente');
  const data = searchParams.get('data');

  const criar = useCriarConsulta();

  async function onSubmit(payload: { paciente_id: number; inicio: string; fim: string; procedimentos: number[]; observacoes?: string }) {
    try {
      await criar.mutateAsync(payload as unknown as Record<string, unknown>);
      toast.success('Consulta agendada!');
      router.push('/agenda');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Erro ao agendar consulta.');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/agenda"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para agenda
      </Link>

      <div>
        <h1
          className="text-2xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Nova consulta
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecione paciente, horário e procedimentos.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <ConsultaForm
          defaultPacienteId={pacienteId ? Number(pacienteId) : undefined}
          defaultDate={data ?? undefined}
          onSubmit={onSubmit}
          loading={criar.isPending}
          onCancel={() => router.push('/agenda')}
        />
      </div>
    </div>
  );
}

'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  Pencil,
  ClipboardList,
  Images,
  Download,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { usePaciente } from '@/hooks/usePacientes';
import { useConsultas } from '@/hooks/useConsultas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusLabel: Record<string, { label: string; cls: string }> = {
  agendada:       { label: 'Agendada',       cls: 'bg-amber-100 text-amber-700' },
  confirmada:     { label: 'Confirmada',     cls: 'bg-emerald-100 text-emerald-700' },
  realizada:      { label: 'Realizada',      cls: 'bg-sky-100 text-sky-700' },
  cancelada:      { label: 'Cancelada',      cls: 'bg-rose-100 text-rose-700' },
  nao_compareceu: { label: 'Não compareceu', cls: 'bg-muted text-muted-foreground' },
};

const avatarGradients = [
  'from-pink-400 to-rose-500',
  'from-violet-400 to-purple-500',
  'from-sky-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-fuchsia-400 to-pink-500',
];

function avatarFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-card text-brand-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function PacienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const pacienteId = Number(id);

  const { data: paciente, isLoading } = usePaciente(pacienteId);
  const { data: consultas } = useConsultas({ paciente_id: pacienteId });
  const [downloading, setDownloading] = useState(false);

  async function baixarPdf() {
    setDownloading(true);
    try {
      const res = await api.get(`/api/pacientes/${pacienteId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historico_paciente_${pacienteId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('PDF gerado!');
    } catch {
      toast.error('Erro ao gerar PDF.');
    } finally {
      setDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!paciente) {
    return <p className="text-sm text-muted-foreground">Paciente não encontrado.</p>;
  }

  const isAnon = !!paciente.anonimizado_em;

  const actions = isAnon
    ? []
    : [
        { href: `/pacientes/${pacienteId}/editar`,   icon: Pencil,         label: 'Editar' },
        { href: `/pacientes/${pacienteId}/anamnese`, icon: ClipboardList,  label: 'Anamnese' },
        { href: `/pacientes/${pacienteId}/fotos`,    icon: Images,         label: 'Fotos' },
      ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/pacientes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para pacientes
      </Link>

      {isAnon && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Paciente anonimizado</p>
          <p className="text-xs text-amber-800/80">
            Dados pessoais foram removidos em conformidade com LGPD Art. 18. Histórico de consultas
            preservado.
          </p>
        </div>
      )}

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className={isAnon ? 'bg-muted p-6' : 'bg-brand-soft p-6'}>
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarFor(paciente.nome_completo)} text-2xl font-bold text-white shadow-lg`}
            >
              {paciente.nome_completo.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1
                className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {paciente.nome_completo}
              </h1>
              {paciente.email && (
                <p className="truncate text-sm text-muted-foreground">{paciente.email}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border p-4">
          {actions.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
          {!isAnon && (
            <button
              onClick={baixarPdf}
              disabled={downloading}
              className="ml-auto inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-3 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:shadow-lg disabled:opacity-50"
            >
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {downloading ? 'Gerando...' : 'Exportar PDF'}
            </button>
          )}
        </div>
      </div>

      {/* Dados pessoais */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <header className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Dados pessoais</h2>
        </header>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {paciente.telefone && (
            <InfoTile icon={Phone} label="Telefone" value={paciente.telefone} />
          )}
          {paciente.email && <InfoTile icon={Mail} label="E-mail" value={paciente.email} />}
          {paciente.data_nascimento && (
            <InfoTile
              icon={Calendar}
              label="Nascimento"
              value={format(new Date(paciente.data_nascimento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            />
          )}
          {paciente.endereco?.cidade && (
            <InfoTile
              icon={MapPin}
              label="Cidade"
              value={`${paciente.endereco.cidade}/${paciente.endereco.uf}`}
            />
          )}
        </div>
        {paciente.observacoes_gerais && (
          <div className="border-t border-border p-5">
            <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <p className="text-sm text-foreground">{paciente.observacoes_gerais}</p>
            </div>
          </div>
        )}
      </section>

      {/* Histórico */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Histórico de consultas</h2>
            <p className="text-xs text-muted-foreground">
              {consultas?.data?.length ?? 0} registro(s)
            </p>
          </div>
          <Link
            href={`/agenda/nova-consulta?paciente=${pacienteId}`}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
          >
            + Agendar
          </Link>
        </header>
        <div className="divide-y divide-border">
          {!consultas?.data?.length ? (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">
              Nenhuma consulta registrada.
            </p>
          ) : (
            consultas.data.map((c) => {
              const s = statusLabel[c.status] ?? { label: c.status, cls: 'bg-muted text-muted-foreground' };
              return (
                <Link
                  key={c.id}
                  href={`/consultas/${c.id}`}
                  className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(c.inicio), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {c.procedimentos?.length ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {c.procedimentos.map((p) => p.nome).join(', ')}
                      </p>
                    ) : null}
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${s.cls}`}>
                    {s.label}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

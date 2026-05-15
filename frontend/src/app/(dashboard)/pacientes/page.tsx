'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Trash2, Users, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { usePacientes, useDeletarPaciente } from '@/hooks/usePacientes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export default function PacientesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const cpfDigits = search.replace(/\D/g, '');
  const isCpf = cpfDigits.length === 11;
  const { data, isLoading } = usePacientes({
    search: !isCpf && search ? search : undefined,
    cpf_hash: isCpf ? cpfDigits : undefined,
    page,
  });
  const deletar = useDeletarPaciente();

  async function handleDelete(id: number, nome: string) {
    const msg =
      `Anonimizar ${nome}?\n\n` +
      `LGPD Art. 18 — direito ao esquecimento.\n` +
      `Os dados pessoais (nome, CPF, contato, anamnese, fotos) serão substituídos por placeholders.\n` +
      `O histórico de consultas será preservado.\n\n` +
      `Esta ação não pode ser desfeita.`;
    if (!confirm(msg)) return;
    try {
      await deletar.mutateAsync(id);
      toast.success('Paciente anonimizado.');
    } catch {
      toast.error('Erro ao anonimizar paciente.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome ou CPF..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <Link
          href="/pacientes/novo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:shadow-lg hover:shadow-brand-500/30 active:translate-y-px"
        >
          <Plus className="h-4 w-4" />
          Novo paciente
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-11 w-11 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-600">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Nenhum paciente encontrado</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {search ? 'Tente outro termo de busca.' : 'Cadastre seu primeiro paciente para começar.'}
            </p>
            {!search && (
              <Link
                href="/pacientes/novo"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Cadastrar paciente
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data?.data?.map((p) => (
              <div
                key={p.id}
                className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/40"
              >
                <button
                  onClick={() => router.push(`/pacientes/${p.id}`)}
                  className="flex flex-1 items-center gap-4 text-left"
                >
                  <div
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarFor(p.nome_completo)} text-sm font-semibold text-white shadow-sm`}
                  >
                    {p.nome_completo.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {p.nome_completo}
                      </p>
                      {p.anonimizado_em && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Anonimizado
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.anonimizado_em
                        ? `Anonimizado em ${format(new Date(p.anonimizado_em), 'dd/MM/yyyy', { locale: ptBR })}`
                        : (
                          <>
                            {p.telefone ?? 'Sem telefone'}
                            {p.data_nascimento && (
                              <>
                                <span className="mx-1.5">·</span>
                                {format(new Date(p.data_nascimento), 'dd/MM/yyyy', { locale: ptBR })}
                              </>
                            )}
                          </>
                        )}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
                {!p.anonimizado_em && (
                  <button
                    onClick={() => handleDelete(p.id, p.nome_completo)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    title="Anonimizar (LGPD)"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {data && data.meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="px-2 text-sm text-muted-foreground">
            Página {page} de {data.meta.last_page}
          </span>
          <button
            disabled={page === data.meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

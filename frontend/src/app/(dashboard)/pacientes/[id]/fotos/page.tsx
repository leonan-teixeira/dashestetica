'use client';

import { use, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Trash2, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePaciente } from '@/hooks/usePacientes';
import { useFotosPaciente, useDeletarFoto } from '@/hooks/useFotos';
import { useConsultas } from '@/hooks/useConsultas';
import { useUploadFoto } from '@/hooks/useFotos';
import type { FotoEvolucao } from '@/types/consulta';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const tipoLabel: Record<string, string> = {
  antes: 'Antes',
  durante: 'Durante',
  depois: 'Depois',
};

const tipoCls: Record<string, string> = {
  antes: 'bg-amber-100 text-amber-700',
  durante: 'bg-sky-100 text-sky-700',
  depois: 'bg-emerald-100 text-emerald-700',
};

const inputCls =
  'w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15';

function FotoCard({ foto, onDelete }: { foto: FotoEvolucao; onDelete: () => void }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card">
      {foto.url ? (
        <img
          src={foto.url}
          alt={tipoLabel[foto.tipo]}
          crossOrigin="use-credentials"
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="flex h-44 items-center justify-center bg-muted">
          <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
        </div>
      )}
      <div className="absolute left-2 top-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur ${
            tipoCls[foto.tipo] ?? 'bg-muted text-muted-foreground'
          }`}
        >
          {tipoLabel[foto.tipo] ?? foto.tipo}
        </span>
      </div>
      <button
        onClick={onDelete}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-card/80 text-destructive opacity-0 backdrop-blur transition-opacity hover:bg-card group-hover:opacity-100"
        title="Remover foto"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <div className="border-t border-border p-2.5">
        {foto.observacao && (
          <p className="truncate text-xs text-foreground">{foto.observacao}</p>
        )}
        <p className="text-[11px] text-muted-foreground">
          {format(new Date(foto.created_at), 'dd/MM/yyyy', { locale: ptBR })}
        </p>
      </div>
    </div>
  );
}

function UploadModal({
  consultas,
  onClose,
}: {
  consultas: { id: number; inicio: string }[];
  pacienteId: number;
  onClose: () => void;
}) {
  const [consultaId, setConsultaId] = useState('');
  const [tipo, setTipo] = useState('antes');
  const [observacao, setObservacao] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = useUploadFoto(Number(consultaId));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !consultaId) {
      toast.error('Selecione a consulta e a foto.');
      return;
    }
    try {
      await upload.mutateAsync({ file, tipo, observacao: observacao || undefined });
      toast.success('Foto enviada!');
      onClose();
    } catch {
      toast.error('Erro ao enviar foto.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Enviar foto</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Consulta *</label>
            <select
              value={consultaId}
              onChange={(e) => setConsultaId(e.target.value)}
              className={inputCls}
            >
              <option value="">Selecionar consulta...</option>
              {consultas.map((c) => (
                <option key={c.id} value={c.id}>
                  {format(new Date(c.inicio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Tipo *</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['antes', 'durante', 'depois'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium capitalize transition-all ${
                    tipo === t
                      ? 'border-primary bg-brand-soft text-brand-700'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Foto *</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-8 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-brand-soft hover:text-brand-700"
            >
              <Upload className="h-4 w-4" />
              {file ? file.name : 'Clique para selecionar ou tirar foto'}
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Observação</label>
            <input
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Opcional"
              className={inputCls}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={upload.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:shadow-lg disabled:opacity-50"
            >
              {upload.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {upload.isPending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FotosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const pacienteId = Number(id);
  const [showUpload, setShowUpload] = useState(false);

  const { data: paciente } = usePaciente(pacienteId);
  const { data: fotos, isLoading } = useFotosPaciente(pacienteId);
  const { data: consultas } = useConsultas({ paciente_id: pacienteId });
  const deletar = useDeletarFoto();

  async function handleDelete(fotoId: number) {
    if (!confirm('Remover esta foto?')) return;
    try {
      await deletar.mutateAsync(fotoId);
      toast.success('Foto removida.');
    } catch {
      toast.error('Erro ao remover foto.');
    }
  }

  const grupos = fotos?.reduce<Record<string, FotoEvolucao[]>>((acc, f) => {
    const chave = f.consulta_id ? String(f.consulta_id) : 'sem-consulta';
    acc[chave] = [...(acc[chave] ?? []), f];
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href={`/pacientes/${pacienteId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-600">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Fotos de evolução
            </h1>
            {paciente && <p className="text-sm text-muted-foreground">{paciente.nome_completo}</p>}
          </div>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:shadow-lg active:translate-y-px"
        >
          <Upload className="h-4 w-4" />
          Enviar foto
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : !fotos?.length ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-600">
            <ImageIcon className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">Nenhuma foto cadastrada</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Envie fotos antes/depois para acompanhar a evolução.
          </p>
        </div>
      ) : (
        Object.entries(grupos ?? {}).map(([consultaId, fotosList]) => {
          const consulta = consultas?.data?.find((c) => String(c.id) === consultaId);
          return (
            <div key={consultaId}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {consulta
                  ? format(new Date(consulta.inicio), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
                  : 'Sem consulta vinculada'}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {fotosList.map((f) => (
                  <FotoCard key={f.id} foto={f} onDelete={() => handleDelete(f.id)} />
                ))}
              </div>
            </div>
          );
        })
      )}

      {showUpload && (
        <UploadModal
          consultas={consultas?.data ?? []}
          pacienteId={pacienteId}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}

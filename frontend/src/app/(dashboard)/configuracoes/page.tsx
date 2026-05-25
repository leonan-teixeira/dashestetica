'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import {
  User,
  Lock,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
  X,
  Clock,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import {
  useLembretes,
  useWhatsappStatus,
  useReenviarLembrete,
  useCancelarLembrete,
  type LembreteStatus,
} from '@/hooks/useLembretes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const inputCls =
  'w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15';

const statusCls: Record<LembreteStatus, string> = {
  pendente:  'bg-amber-100 text-amber-700',
  enviado:   'bg-emerald-100 text-emerald-700',
  falhou:    'bg-rose-100 text-rose-700',
  cancelado: 'bg-muted text-muted-foreground',
};

export default function ConfiguracoesPage() {
  const user = useAuthStore((s) => s.user);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const { data: whats } = useWhatsappStatus();
  const { data: lembretes } = useLembretes();
  const reenviar = useReenviarLembrete();
  const cancelar = useCancelarLembrete();

  async function handleSenha(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha !== confirmar) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (novaSenha.length < 8) {
      toast.error('Senha deve ter ao menos 8 caracteres.');
      return;
    }
    setSavingPwd(true);
    try {
      await api.put('/me/senha', {
        current_password: senhaAtual,
        password: novaSenha,
        password_confirmation: confirmar,
      });
      toast.success('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmar('');
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 422) {
        toast.error('Senha atual incorreta.');
      } else {
        toast.error('Erro ao alterar senha.');
      }
    } finally {
      setSavingPwd(false);
    }
  }

  async function handleReenviar(id: number) {
    try {
      await reenviar.mutateAsync(id);
      toast.success('Lembrete reenviado para fila.');
    } catch {
      toast.error('Erro ao reenviar.');
    }
  }

  async function handleCancelar(id: number) {
    if (!confirm('Cancelar lembrete?')) return;
    try {
      await cancelar.mutateAsync(id);
      toast.success('Lembrete cancelado.');
    } catch {
      toast.error('Erro ao cancelar.');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Conta */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand-600">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Conta</h2>
            <p className="text-xs text-muted-foreground">Dados da sua conta de acesso</p>
          </div>
        </header>
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Nome</span>
            <span className="text-sm font-medium text-foreground">{user?.name ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">E-mail</span>
            <span className="text-sm font-medium text-foreground">{user?.email ?? '—'}</span>
          </div>
        </div>
      </section>

      {/* Senha */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand-600">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Alterar senha</h2>
            <p className="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
          </div>
        </header>
        <form onSubmit={handleSenha} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Senha atual</label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Nova senha</label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
              minLength={8}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingPwd}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:shadow-lg disabled:opacity-50"
            >
              {savingPwd && <Loader2 className="h-4 w-4 animate-spin" />}
              {savingPwd ? 'Salvando...' : 'Alterar senha'}
            </button>
          </div>
        </form>
      </section>

      {/* WhatsApp */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">WhatsApp (Evolution API)</h2>
            <p className="text-xs text-muted-foreground">Envio de lembretes 24h antes da consulta</p>
          </div>
          {whats && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                whats.configurado ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {whats.configurado ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {whats.configurado ? 'Configurado' : 'Não configurado'}
            </span>
          )}
        </header>
        <div className="p-5">
          {!whats?.configurado ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              <p className="font-semibold">Configure a Evolution API:</p>
              <ol className="mt-2 list-decimal space-y-1 pl-4">
                <li>Suba a Evolution API (Docker recomendado): <code className="rounded bg-white/70 px-1 py-0.5 font-mono">docker run -p 8080:8080 atendai/evolution-api:latest</code></li>
                <li>Crie uma instância e escaneie o QR code com WhatsApp do número</li>
                <li>Defina no <code className="rounded bg-white/70 px-1 py-0.5 font-mono">.env</code> do backend:
                  <pre className="mt-1 overflow-x-auto rounded-lg bg-white/60 p-2 font-mono text-[11px]">
EVOLUTION_URL=http://localhost:8080{'\n'}EVOLUTION_INSTANCE=estetica{'\n'}EVOLUTION_API_KEY=sua-chave</pre>
                </li>
                <li>Rode o worker: <code className="rounded bg-white/70 px-1 py-0.5 font-mono">php artisan queue:work</code></li>
                <li>Rode o scheduler: <code className="rounded bg-white/70 px-1 py-0.5 font-mono">php artisan schedule:work</code></li>
              </ol>
            </div>
          ) : (
            <p className="text-sm text-foreground">
              Instância <span className="font-semibold">{whats.instance}</span> ativa. Lembretes vencidos
              são enviados a cada minuto pelo scheduler.
            </p>
          )}
        </div>

        {/* Lista de lembretes */}
        <div className="border-t border-border">
          <header className="flex items-center justify-between px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Últimos lembretes
            </p>
            <span className="text-xs text-muted-foreground">{lembretes?.data?.length ?? 0}</span>
          </header>
          <div className="divide-y divide-border">
            {!lembretes?.data?.length ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                Nenhum lembrete ainda.
              </p>
            ) : (
              lembretes.data.slice(0, 8).map((l) => (
                <div key={l.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {l.paciente?.nome_completo ?? `Paciente #${l.paciente_id}`}
                      </p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusCls[l.status]}`}>
                        {l.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(l.agendado_para), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      {l.tentativas > 0 && ` · ${l.tentativas} tentativa(s)`}
                    </p>
                    {l.ultimo_erro && (
                      <p className="mt-1 truncate text-[11px] text-rose-600" title={l.ultimo_erro}>
                        {l.ultimo_erro}
                      </p>
                    )}
                  </div>
                  {(l.status === 'falhou' || l.status === 'pendente') && (
                    <button
                      onClick={() => handleReenviar(l.id)}
                      title="Reenviar agora"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-brand-soft hover:text-brand-700"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {l.status !== 'cancelado' && l.status !== 'enviado' && (
                    <button
                      onClick={() => handleCancelar(l.id)}
                      title="Cancelar"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

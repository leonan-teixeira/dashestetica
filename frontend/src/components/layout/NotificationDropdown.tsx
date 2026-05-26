'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bell, CalendarClock, AlertTriangle, RefreshCw, X, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const LS_KEY = 'notif_lidas';

interface Notificacao {
  tipo: 'consulta_hoje' | 'lembrete_falhou' | 'retorno_sugerido';
  titulo: string;
  corpo: string;
  link: string;
  data: string;
}

const tipoConfig = {
  consulta_hoje: {
    icon: CalendarClock,
    bg: 'bg-sky-100 text-sky-600',
    label: 'Hoje',
  },
  lembrete_falhou: {
    icon: AlertTriangle,
    bg: 'bg-rose-100 text-rose-600',
    label: 'Falha',
  },
  retorno_sugerido: {
    icon: RefreshCw,
    bg: 'bg-amber-100 text-amber-600',
    label: 'Retorno',
  },
};

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, refetch } = useQuery({
    queryKey: ['notificacoes'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Notificacao[]; total: number }>('/notificacoes');
      return data;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const [verMais, setVerMais]   = useState(false);
  const [lidas, setLidas]       = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem(LS_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
  });

  const salvarLidas = useCallback((novas: Set<string>) => {
    setLidas(novas);
    localStorage.setItem(LS_KEY, JSON.stringify([...novas]));
  }, []);

  const total        = data?.total ?? 0;
  const notificacoes = data?.data ?? [];
  const naoLidas     = notificacoes.filter((n) => !lidas.has(n.link));
  const visiveis     = verMais ? notificacoes : notificacoes.slice(0, 5);
  const temMais      = notificacoes.length > 5;
  const badgeCount   = naoLidas.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((v) => !v); setVerMais(false); if (!open) refetch(); }}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title="Notificações"
      >
        <Bell className="h-4 w-4" />
        {badgeCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/10">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Notificações</h3>
            <div className="flex items-center gap-1">
              {naoLidas.length > 0 && (
                <button
                  onClick={() => salvarLidas(new Set(notificacoes.map((n) => n.link)))}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-500 hover:bg-muted transition-colors"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Marcar todas
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {notificacoes.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Tudo em dia!</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-border">
              {visiveis.map((n, i) => {
                const cfg    = tipoConfig[n.tipo];
                const Icon   = cfg.icon;
                const isLida = lidas.has(n.link);
                return (
                  <div key={i} className={cn('relative group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50', !isLida && 'bg-brand-500/5')}>
                    {!isLida && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-brand-500" />
                    )}
                    <Link
                      href={n.link}
                      onClick={() => {
                        salvarLidas(new Set([...lidas, n.link]));
                        setOpen(false);
                      }}
                      className="flex flex-1 items-start gap-3 min-w-0"
                    >
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cn('truncate text-sm text-foreground', !isLida && 'font-semibold')}>{n.titulo}</p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">{n.corpo}</p>
                      </div>
                    </Link>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {cfg.label}
                      </span>
                      {!isLida && (
                        <button
                          onClick={() => salvarLidas(new Set([...lidas, n.link]))}
                          className="text-[10px] text-brand-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Marcar como lida"
                        >
                          Lida
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {notificacoes.length > 0 && (
            <div className="border-t border-border px-4 py-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{total} notificação{total !== 1 ? 'ões' : ''} ativa{total !== 1 ? 's' : ''}</p>
              {temMais && (
                <button
                  onClick={() => setVerMais((v) => !v)}
                  className="text-xs font-medium text-brand-500 hover:underline"
                >
                  {verMais ? 'Ver menos' : `Ver mais (${notificacoes.length - 5})`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

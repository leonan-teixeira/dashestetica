'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';

const titles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Visão geral do seu studio' },
  '/pacientes': { title: 'Pacientes', subtitle: 'Gerencie seu cadastro de pacientes' },
  '/agenda': { title: 'Agenda', subtitle: 'Próximas consultas e horários' },
  '/procedimentos': { title: 'Procedimentos', subtitle: 'Catálogo de serviços oferecidos' },
  '/consultas': { title: 'Consultas', subtitle: 'Histórico e filtros de atendimentos' },
  '/configuracoes': { title: 'Configurações', subtitle: 'Conta, segurança e integrações' },
};

function getHeaderInfo(pathname: string) {
  const match = Object.keys(titles).find((key) => pathname.startsWith(key));
  return match ? titles[match] : { title: '', subtitle: '' };
}

export function Header() {
  const pathname = usePathname();
  const { title, subtitle } = getHeaderInfo(pathname);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border glass px-6">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">{title}</h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Buscar"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Notificações"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
        </button>
      </div>
    </header>
  );
}

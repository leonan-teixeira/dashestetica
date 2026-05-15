import { Logo } from '@/components/layout/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Painel lateral — branding */}
      <aside className="relative hidden overflow-hidden bg-brand-gradient lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-30 mix-blend-overlay">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-200 blur-3xl" />
        </div>

        <div className="relative z-10 text-white">
          <Logo />
        </div>

        <div className="relative z-10 max-w-md text-white">
          <h2
            className="text-3xl font-semibold leading-tight tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Gestão completa do seu studio de estética em um só lugar.
          </h2>
          <p className="mt-4 text-sm text-white/80">
            Pacientes, agendamentos, evolução clínica e fotos comparativas — tudo organizado e em conformidade com a LGPD.
          </p>
          <div className="mt-8 flex items-center gap-2 text-xs text-white/70">
            <span className="h-px w-8 bg-white/40" />
            Estética Studio · 2026
          </div>
        </div>
      </aside>

      {/* Form */}
      <div className="flex min-h-screen items-center justify-center px-4 py-12 lg:min-h-0">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

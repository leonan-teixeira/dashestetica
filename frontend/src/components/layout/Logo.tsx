import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-md shadow-brand-500/30">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c0 4-3 7-3 9a3 3 0 0 0 6 0c0-2-3-5-3-9z" />
          <path d="M5 13c0 4 3 8 7 8s7-4 7-8" />
        </svg>
      </span>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            Estética
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Studio
          </span>
        </div>
      )}
    </div>
  );
}

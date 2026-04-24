import { SITE_NAME } from '@/lib/site';

interface Props {
  dayNumber: number;
  streak?: number;
}

export default function Header({ dayNumber, streak = 0 }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-4 max-w-[640px] mx-auto w-full">
      <a
        href="/"
        className="text-sm font-mono tracking-widest uppercase"
        style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
      >
        {SITE_NAME}
      </a>

      <div className="flex items-center gap-4">
        {streak > 0 && (
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            🔥 {streak}
          </span>
        )}
        <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
          #{dayNumber}
        </span>
      </div>
    </header>
  );
}

import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

interface Props {
  dayNumber: number;
  streak?: number;
}

export default function Header({ dayNumber, streak = 0 }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-3 sm:py-4 max-w-[760px] mx-auto w-full gap-3">
      <Link
        href="/"
        className="text-xs sm:text-sm font-mono tracking-[0.2em] sm:tracking-widest uppercase whitespace-nowrap"
        style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
      >
        {SITE_NAME}
      </Link>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
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

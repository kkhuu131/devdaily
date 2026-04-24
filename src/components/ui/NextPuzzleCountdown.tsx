'use client';

import { useEffect, useState } from 'react';
import { formatCountdownHms, getMsUntilNextUtcMidnight } from '@/lib/daily-calendar';

export default function NextPuzzleCountdown() {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemainingMs(getMsUntilNextUtcMidnight());
    const initialTimer = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(id);
    };
  }, []);

  const countdownLabel = remainingMs === null ? '--:--:--' : formatCountdownHms(remainingMs);

  return (
    <div
      className="pt-4 mt-2"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Next puzzle
        </p>
        <time
          className="text-lg font-mono tabular-nums tracking-tight"
          style={{ color: 'var(--text-primary)' }}
          aria-live="polite"
          aria-label={`Next puzzle in ${countdownLabel}`}
        >
          {countdownLabel}
        </time>
      </div>
      <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        New challenge at 00:00 UTC (same moment the home page switches puzzles).
      </p>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import type { StatsState } from '@/types/puzzle';
import { getStats } from '@/lib/storage';

interface Props {
  currentScore: number;
  currentStreak: number;
}

export default function StatsPanel({ currentScore, currentStreak }: Props) {
  const [stats, setStats] = useState<StatsState | null>(null);

  useEffect(() => {
    setStats(getStats());
  }, []);

  if (!stats || stats.played === 0) return null;

  const perfectPct =
    stats.played > 0 ? Math.round((stats.distribution[3] / stats.played) * 100) : 0;
  const maxDist = Math.max(...stats.distribution, 1);

  const statItems = [
    { value: stats.played, label: 'Played' },
    { value: `${perfectPct}%`, label: 'Perfect' },
    { value: currentStreak, label: 'Streak' },
    { value: stats.bestStreak, label: 'Best' },
  ];

  return (
    <div
      className="rounded-sm p-5 sm:p-6 mb-4"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        Your stats
      </p>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {statItems.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p
              className="text-2xl font-mono tabular-nums leading-none mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {value}
            </p>
            <p
              className="text-[10px] uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        {([3, 2, 1, 0] as const).map((score) => {
          const count = stats.distribution[score];
          const barPct = count > 0 ? Math.max((count / maxDist) * 100, 8) : 0;
          const isActive = score === currentScore;

          return (
            <div key={score} className="flex items-center gap-2 text-xs">
              <span
                className="w-6 text-right tabular-nums shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {score}/3
              </span>
              <div className="flex-1 h-5 relative">
                {count > 0 ? (
                  <div
                    className="h-full flex items-center justify-end pr-2"
                    style={{
                      width: `${barPct}%`,
                      backgroundColor: isActive ? 'var(--accent-brand)' : 'var(--bg-elevated)',
                      borderRadius: '2px',
                    }}
                  >
                    <span
                      className="tabular-nums font-mono text-[11px]"
                      style={{
                        color: isActive ? 'var(--bg-base)' : 'var(--text-secondary)',
                      }}
                    >
                      {count}
                    </span>
                  </div>
                ) : (
                  <div className="h-full flex items-center">
                    <span
                      className="tabular-nums font-mono text-[11px] pl-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      0
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

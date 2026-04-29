'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Category } from '@/types/puzzle';

export interface ArchiveItem {
  dayNumber: number;
  puzzleId: number;
  conceptName: string;
  category: Category;
}

const CATEGORY_LABEL: Record<Category, string> = {
  'code-smell': 'smell',
  'solid': 'SOLID',
  'design-pattern': 'pattern',
  'principle': 'principle',
  'refactoring': 'refactoring',
};

function readCompletedIds(items: ArchiveItem[]): Set<number> {
  const completed = new Set<number>();
  for (const { puzzleId } of items) {
    try {
      const raw = localStorage.getItem(`devdaily_archive_${puzzleId}`);
      if (!raw) continue;
      const stored = JSON.parse(raw) as { phase?: string };
      if (stored.phase === 'COMPLETED') completed.add(puzzleId);
    } catch {
      // ignore malformed entries
    }
  }
  return completed;
}

export default function ArchiveList({ items }: { items: ArchiveItem[] }) {
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setCompletedIds(readCompletedIds(items));
  }, [items]);

  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {items.map(({ dayNumber, puzzleId, conceptName, category }, i) => {
        const done = completedIds.has(puzzleId);
        return (
          <div key={dayNumber}>
            {i > 0 && (
              <div
                className="h-px"
                style={{ backgroundColor: 'var(--border-subtle)' }}
              />
            )}
            <Link
              href={`/archive/${dayNumber}`}
              className={`archive-row${done ? ' archive-row-done' : ''} flex items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4`}
            >
              <span
                className="text-xs tabular-nums w-8 shrink-0 transition-colors duration-100"
                style={{ color: done ? 'var(--accent-correct)' : 'var(--text-muted)' }}
              >
                #{dayNumber}
              </span>
              <span
                className="archive-row-title flex-1 text-sm leading-relaxed transition-colors duration-100"
                style={{ color: 'var(--text-primary)' }}
              >
                {conceptName}
              </span>
              <span
                className="text-xs shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {CATEGORY_LABEL[category]}
              </span>
              <span
                className="archive-row-end text-xs shrink-0 transition-colors duration-100"
                style={{ color: done ? 'var(--accent-correct)' : 'var(--text-muted)' }}
              >
                {done ? '✓' : '→'}
              </span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

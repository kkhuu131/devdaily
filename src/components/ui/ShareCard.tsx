'use client';

import { useState } from 'react';
import type { Puzzle } from '@/types/puzzle';
import { generateShareText } from '@/lib/share';

interface Props {
  puzzle: Puzzle;
  answers: (string | null)[];
  dayNumber: number;
  streak: number;
}

export default function ShareCard({ puzzle, answers, dayNumber, streak }: Props) {
  const [copied, setCopied] = useState(false);

  const shareText = generateShareText({ dayNumber, puzzle, answers, streak });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text from textarea
    }
  }

  return (
    <div
      className="rounded-sm p-4 mt-6"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <pre
        className="text-xs leading-relaxed whitespace-pre-wrap mb-4"
        style={{ color: 'var(--text-secondary)', fontFamily: 'inherit' }}
      >
        {shareText}
      </pre>

      <button
        onClick={handleCopy}
        className="w-full py-2.5 min-h-11 rounded-sm text-sm transition-colors duration-150"
        style={{
          backgroundColor: copied ? 'var(--accent-correct-subtle)' : 'var(--bg-surface)',
          border: `1px solid ${copied ? 'var(--accent-correct)' : 'var(--border-subtle)'}`,
          color: copied ? 'var(--accent-correct)' : 'var(--text-secondary)',
        }}
      >
        {copied ? '✓ Copied' : 'Copy result'}
      </button>
    </div>
  );
}

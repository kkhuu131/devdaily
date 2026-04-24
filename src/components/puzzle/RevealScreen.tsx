'use client';

import type { Puzzle } from '@/types/puzzle';
import { isAnswerCorrect } from '@/lib/puzzle-utils';
import NextPuzzleCountdown from '@/components/ui/NextPuzzleCountdown';
import ShareCard from '@/components/ui/ShareCard';

interface Props {
  puzzle: Puzzle;
  answers: (string | null)[];
  dayNumber: number;
  streak: number;
}

function ConceptName({ name }: { name: string }) {
  return (
    <h1
      className="text-4xl leading-tight mb-4"
      style={{
        fontFamily: 'var(--font-instrument-serif)',
        color: 'var(--accent-brand)',
        fontStyle: 'italic',
      }}
    >
      {name.split('').map((char, i) => (
        <span
          key={i}
          style={{
            opacity: 0,
            animation: 'revealChar 40ms forwards',
            animationDelay: `${i * 35}ms`,
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : undefined,
          }}
        >
          {char}
        </span>
      ))}
    </h1>
  );
}

function ScoreRow({
  puzzle,
  answers,
}: {
  puzzle: Puzzle;
  answers: (string | null)[];
}) {
  const marks = puzzle.questions.map((q, i) => {
    const chosen = answers[i];
    return isAnswerCorrect(chosen, q, puzzle.id) ? '✅' : '❌';
  });

  const score = marks.filter((m) => m === '✅').length;

  return (
    <div className="flex items-center gap-4 mb-6">
      <span
        className="text-2xl font-mono tabular-nums"
        style={{ color: 'var(--text-primary)' }}
      >
        {score}/3
      </span>
      <div className="flex gap-2 text-base">
        {marks.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
    </div>
  );
}

export default function RevealScreen({ puzzle, answers, dayNumber, streak }: Props) {
  return (
    <div className="animate-fade-up px-4 max-w-[640px] mx-auto w-full pb-8">
      <div
        className="rounded-sm p-6 mb-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <ScoreRow puzzle={puzzle} answers={answers} />

        <NextPuzzleCountdown />

        <p className="text-xs mb-2 mt-5" style={{ color: 'var(--text-muted)' }}>
          Today&apos;s concept
        </p>

        <ConceptName name={puzzle.conceptName} />

        <div
          className="h-px mb-4"
          style={{ backgroundColor: 'var(--border-subtle)' }}
        />

        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
          {puzzle.definition}
        </p>

        <div
          className="pl-4 mb-6"
          style={{ borderLeft: '2px solid var(--accent-brand)' }}
        >
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            Rule of thumb
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{
              color: 'var(--text-primary)',
              backgroundColor: 'var(--accent-brand-subtle)',
              padding: '10px 12px',
              borderRadius: '2px',
            }}
          >
            {puzzle.ruleOfThumb}
          </p>
        </div>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {puzzle.citation.author} · {puzzle.citation.bookTitle} · {puzzle.citation.chapter}
          {puzzle.citation.page ? ` · p. ${puzzle.citation.page}` : ''}
        </p>
      </div>

      <a
        href={puzzle.citation.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-2.5 rounded-sm text-sm text-center transition-colors duration-150 mb-0"
        style={{
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-secondary)',
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--accent-brand)';
          e.currentTarget.style.borderColor = 'var(--accent-brand)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }}
      >
        Learn more →
      </a>

      <ShareCard
        puzzle={puzzle}
        answers={answers}
        dayNumber={dayNumber}
        streak={streak}
      />
    </div>
  );
}

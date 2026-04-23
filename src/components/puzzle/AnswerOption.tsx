'use client';

import { useEffect, useRef } from 'react';
import type { AnswerOption as AnswerOptionType } from '@/types/puzzle';

export type OptionState = 'default' | 'selected' | 'correct' | 'wrong' | 'correct-alt';

interface Props {
  option: AnswerOptionType;
  state: OptionState;
  disabled: boolean;
  large?: boolean;
  onClick: (id: string) => void;
}

const STATE_STYLES: Record<OptionState, React.CSSProperties> = {
  default: {
    borderColor: 'var(--accent-neutral)',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
  },
  selected: {
    borderColor: 'var(--accent-brand)',
    borderLeftWidth: '3px',
    backgroundColor: 'var(--accent-brand-subtle)',
    color: 'var(--text-primary)',
  },
  correct: {
    borderColor: 'var(--accent-correct)',
    backgroundColor: 'var(--accent-correct-subtle)',
    color: 'var(--text-primary)',
  },
  wrong: {
    borderColor: 'var(--accent-wrong)',
    backgroundColor: 'var(--accent-wrong-subtle)',
    color: 'var(--text-primary)',
  },
  'correct-alt': {
    borderColor: 'var(--accent-correct)',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
  },
};

const LABEL_COLORS: Record<OptionState, string> = {
  default: 'var(--text-muted)',
  selected: 'var(--accent-brand)',
  correct: 'var(--accent-correct)',
  wrong: 'var(--accent-wrong)',
  'correct-alt': 'var(--accent-correct)',
};

export default function AnswerOption({ option, state, disabled, large = false, onClick }: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state === 'wrong') {
      ref.current?.classList.add('animate-shake');
      const timer = setTimeout(() => {
        ref.current?.classList.remove('animate-shake');
      }, 300);
      return () => clearTimeout(timer);
    }
    if (state === 'correct') {
      ref.current?.classList.add('animate-correct-glow');
      const timer = setTimeout(() => {
        ref.current?.classList.remove('animate-correct-glow');
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const icon = state === 'correct' || state === 'correct-alt' ? '✓' : state === 'wrong' ? '✗' : null;

  return (
    <button
      ref={ref}
      onClick={() => !disabled && onClick(option.id)}
      disabled={disabled && state === 'default'}
      className={`
        w-full flex items-start gap-4 text-left border rounded-sm
        transition-transform duration-100 ease-out
        ${!disabled && state === 'default' ? 'hover:translate-x-0.5 cursor-pointer' : 'cursor-default'}
        ${large ? 'p-5' : 'p-4'}
      `}
      style={STATE_STYLES[state]}
    >
      <span
        className="shrink-0 w-5 text-xs leading-relaxed tabular-nums"
        style={{ color: LABEL_COLORS[state] }}
      >
        {icon ?? option.id}
      </span>
      <span className={`${large ? 'text-sm' : 'text-sm'} leading-relaxed`}>
        {option.text}
      </span>
    </button>
  );
}

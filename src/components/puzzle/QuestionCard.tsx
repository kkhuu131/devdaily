'use client';

import type { Question } from '@/types/puzzle';
import { getShuffledOptions } from '@/lib/puzzle-utils';
import AnswerOption, { type OptionState } from './AnswerOption';
import CodeSnippet from './CodeSnippet';

interface Props {
  question: Question;
  highlightedCode: string | null;
  selectedAnswer: string | null;
  locked: boolean;
  fadingOut: boolean;
  puzzleId: number;
  onAnswer: (id: string) => void;
  onContinue: () => void;
}

function getOptionState(
  optionId: string,
  isCorrect: boolean,
  selectedAnswer: string | null,
  locked: boolean,
): OptionState {
  if (!locked || !selectedAnswer) {
    return optionId === selectedAnswer ? 'selected' : 'default';
  }
  if (isCorrect && optionId === selectedAnswer) return 'correct';
  if (isCorrect && optionId !== selectedAnswer) return 'correct-alt';
  if (!isCorrect && optionId === selectedAnswer) return 'wrong';
  return 'default';
}

export default function QuestionCard({
  question,
  highlightedCode,
  selectedAnswer,
  locked,
  fadingOut,
  puzzleId,
  onAnswer,
  onContinue,
}: Props) {
  const isWhichOne = question.format === 'which-one';
  const options = getShuffledOptions(question.options, puzzleId, question.id, question.format);

  const selectedOption = selectedAnswer
    ? options.find((o) => o.id === selectedAnswer)
    : null;
  const isCorrect = selectedOption?.isCorrect ?? false;

  return (
    <div className={`${fadingOut ? 'animate-question-out' : 'animate-fade-up'} px-4 max-w-[760px] mx-auto w-full`}>
      <div
        className="rounded-sm p-4 sm:p-5 mb-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {question.prompt}
        </p>

        {highlightedCode && (
          <CodeSnippet
            highlightedHtml={highlightedCode}
            language={question.language}
          />
        )}
      </div>

      <div className={`flex flex-col ${isWhichOne ? 'gap-3' : 'gap-2'}`}>
        {options.map((option) => (
          <AnswerOption
            key={option.id}
            option={option}
            state={getOptionState(option.id, option.isCorrect, selectedAnswer, locked)}
            disabled={locked}
            large={isWhichOne}
            onClick={onAnswer}
          />
        ))}
      </div>

      {locked && selectedOption && (
        <div
          className="animate-fade-up mt-3 rounded-sm p-4"
          style={{
            borderLeft: `2px solid ${isCorrect ? 'var(--accent-correct)' : 'var(--accent-wrong)'}`,
            backgroundColor: isCorrect ? 'var(--accent-correct-subtle)' : 'var(--accent-wrong-subtle)',
          }}
        >
          <p className="text-xs mb-1" style={{ color: isCorrect ? 'var(--accent-correct)' : 'var(--accent-wrong)' }}>
            {isCorrect ? 'Correct' : 'Incorrect'}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {selectedOption.explanation}
          </p>
        </div>
      )}

      {locked && (
        <button
          onClick={onContinue}
          className="w-full mt-3 py-2.5 min-h-11 rounded-sm text-sm transition-colors duration-150"
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
          Continue →
        </button>
      )}
    </div>
  );
}

'use client';

import type { Question } from '@/types/puzzle';
import AnswerOption, { type OptionState } from './AnswerOption';
import CodeSnippet from './CodeSnippet';

interface Props {
  question: Question;
  highlightedCode: string | null;
  selectedAnswer: string | null;
  locked: boolean;
  onAnswer: (id: string) => void;
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
  onAnswer,
}: Props) {
  const isWhichOne = question.format === 'which-one';

  return (
    <div className="animate-fade-up px-4 max-w-[640px] mx-auto w-full">
      <div
        className="rounded-sm p-5 mb-4"
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
        {question.options.map((option) => (
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
    </div>
  );
}

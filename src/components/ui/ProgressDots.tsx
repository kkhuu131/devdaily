import type { GameState, Puzzle } from '@/types/puzzle';
import { isAnswerCorrect } from '@/lib/puzzle-utils';

interface Props {
  phase: GameState;
  answers: (string | null)[];
  puzzle: Puzzle;
}

function getQuestionResult(
  answer: string | null,
  puzzle: Puzzle,
  questionIndex: number,
): 'unanswered' | 'correct' | 'wrong' {
  if (!answer) return 'unanswered';
  const question = puzzle.questions[questionIndex];
  if (!question) return 'unanswered';
  return isAnswerCorrect(answer, question, puzzle.id) ? 'correct' : 'wrong';
}

const QUESTION_PHASES: GameState[] = ['QUESTION_1', 'QUESTION_2', 'QUESTION_3'];

export default function ProgressDots({ phase, answers, puzzle }: Props) {
  const currentIndex = QUESTION_PHASES.indexOf(phase);

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 pb-6 max-w-[760px] mx-auto w-full">
      {([0, 1, 2] as const).map((i) => {
        const result = getQuestionResult(answers[i], puzzle, i);
        const isActive = currentIndex === i;
        const isPast = currentIndex > i || currentIndex === -1;

        let dotColor = 'var(--accent-neutral)';
        if (result === 'correct') dotColor = 'var(--accent-correct)';
        else if (result === 'wrong') dotColor = 'var(--accent-wrong)';
        else if (isActive) dotColor = 'var(--accent-brand)';

        return (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-200 ${isActive ? 'animate-dot-pulse' : ''}`}
              style={{ backgroundColor: dotColor }}
            />
            {i < 2 && (
              <div
                className="w-6 h-px"
                style={{
                  backgroundColor: isPast ? 'var(--accent-neutral)' : 'var(--border-subtle)',
                }}
              />
            )}
          </div>
        );
      })}
      <span className="ml-0 sm:ml-1 text-xs w-full sm:w-auto" style={{ color: 'var(--text-muted)' }}>
        {currentIndex >= 0 ? `Q${currentIndex + 1} of 3` : ''}
      </span>
    </div>
  );
}

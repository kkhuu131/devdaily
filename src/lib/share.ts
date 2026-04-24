import type { Puzzle } from '@/types/puzzle';
import { isAnswerCorrect } from '@/lib/puzzle-utils';

export function generateShareText(params: {
  dayNumber: number;
  puzzle: Puzzle;
  answers: (string | null)[];
  streak: number;
}): string {
  const { dayNumber, puzzle, answers, streak } = params;

  const marks = puzzle.questions.map((q, i) => {
    const chosen = answers[i];
    if (!chosen) return '⬜';
    return isAnswerCorrect(chosen, q, puzzle.id) ? '✅' : '❌';
  });

  const score = puzzle.questions.filter((q, i) =>
    isAnswerCorrect(answers[i], q, puzzle.id),
  ).length;

  const streakLine = streak > 0 ? ` • Streak: ${streak}` : '';

  return [
    `🧠 DevDaily #${dayNumber} — ${puzzle.conceptName}`,
    '',
    `Q1 ${marks[0]}  Q2 ${marks[1]}  Q3 ${marks[2]}`,
    `Score: ${score}/3${streakLine}`,
    '',
    'devdaily.dev',
  ].join('\n');
}

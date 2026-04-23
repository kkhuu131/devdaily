import type { Puzzle } from '@/types/puzzle';

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
    const correct = q.options.find((o) => o.isCorrect)?.id;
    return chosen === correct ? '✅' : '❌';
  });

  const score = puzzle.questions.filter((q, i) => {
    const correct = q.options.find((o) => o.isCorrect)?.id;
    return answers[i] === correct;
  }).length;

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

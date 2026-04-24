import type { AnswerOption, QuestionFormat } from '@/types/puzzle';

const OPTION_IDS = ['a', 'b', 'c', 'd'] as const;

// Deterministic Fisher-Yates using a simple LCG.
// Same seed always produces the same shuffle order on both server and client.
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = ((s * 1664525) + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Shuffles and remaps IDs for multiple-choice and true-false questions so the
// correct answer isn't always option 'a'. which-one questions are intentionally
// excluded — their Version A / Version B labels are fixed in the JSON content
// so the code snippet and option text always stay in sync.
export function getShuffledOptions(
  options: AnswerOption[],
  puzzleId: number,
  questionId: number,
  format: QuestionFormat,
): AnswerOption[] {
  if (format === 'which-one') return options;

  const seed = puzzleId * 10 + questionId;
  const shuffled = seededShuffle([...options], seed);
  return shuffled.map((opt, i) => ({ ...opt, id: OPTION_IDS[i] }));
}

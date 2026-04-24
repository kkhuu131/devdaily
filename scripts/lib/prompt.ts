import type { Category } from '../../src/types/puzzle';

interface PromptInput {
  conceptName: string;
  conceptKey: string;
  category: Category;
  forcedWhichOneCorrectOption: 'a' | 'b';
}

export function buildSystemPrompt(): string {
  return [
    'You generate one JSON puzzle for DevDaily, a daily software-craft pattern-recognition game for developers.',
    'Return ONLY valid JSON, no markdown, no prose wrapper.',
    'This is NOT algorithm trivia or LeetCode. It is judgment training using realistic code design scenarios.',
    'Use concise, practical TypeScript examples and realistic business context naming.',
    'Question sequence is fixed: Q1 easy recognition, Q2 medium ambiguity, Q3 hard judgment call.',
    'Question formats are fixed: Q1 multiple-choice, Q2 multiple-choice, Q3 which-one.',
    'For multiple-choice, output 4 options (a,b,c,d) with exactly one isCorrect=true.',
    'For which-one, output exactly 2 options (a,b) with exactly one isCorrect=true.',
    'Never reveal the concept name in any option text.',
    'Wrong options must be plausible misconceptions, not obviously silly.',
    'Explanations must teach why the choice is right/wrong in concrete terms.',
    'Q3 should compare two plausible designs; the wrong one should fail for nuanced structural reasons.',
    'Citations should be credible software-craft sources (Fowler, GoF, Clean Code, Pragmatic Programmer, or similarly credible references).',
    'Keep concept naming canonical and professional.',
  ].join(' ');
}

export function buildUserPrompt(input: PromptInput): string {
  const sideInstruction =
    input.forcedWhichOneCorrectOption === 'a'
      ? 'In question 3 (`which-one`), option `a` MUST be correct and option `b` MUST be incorrect.'
      : 'In question 3 (`which-one`), option `b` MUST be correct and option `a` MUST be incorrect.';

  return `
Generate exactly one puzzle JSON object matching this TypeScript-like shape:
{
  id: number,
  conceptName: string,
  category: "code-smell" | "solid" | "design-pattern" | "principle" | "refactoring",
  definition: string,
  ruleOfThumb: string,
  citation: {
    author: string,
    bookTitle: string,
    chapter: string,
    page?: string,
    externalUrl: string
  },
  questions: [
    {
      id: 1,
      format: "multiple-choice",
      difficulty: "easy",
      prompt: string,
      codeSnippet?: string,
      language?: "typescript",
      options: [{ id: "a"|"b"|"c"|"d", text: string, isCorrect: boolean, explanation: string }]
    },
    {
      id: 2,
      format: "multiple-choice",
      difficulty: "medium",
      prompt: string,
      codeSnippet?: string,
      language?: "typescript",
      options: [{ id: "a"|"b"|"c"|"d", text: string, isCorrect: boolean, explanation: string }]
    },
    {
      id: 3,
      format: "which-one",
      difficulty: "hard",
      prompt: string,
      codeSnippet?: string,
      language?: "typescript",
      options: [{ id: "a"|"b", text: string, isCorrect: boolean, explanation: string }]
    }
  ]
}

Constraints:
- Topic:
  - conceptName: "${input.conceptName}"
  - conceptKey: "${input.conceptKey}"
  - category: "${input.category}"
- ${sideInstruction}
- Keep all option texts free of the exact concept name ("${input.conceptName}").
- Keep tone practical and senior-developer friendly.
- Avoid repeating exact wording in prompt vs explanations.
- Ensure distractors are plausible.
- Keep code snippets short enough for mobile reading.
- Prefer snippets around 8-22 lines each.
- Q3 (which-one) should generally show "Version A" and "Version B" in snippet/comments.
- Use valid JSON escaping for newlines in codeSnippet.
`.trim();
}

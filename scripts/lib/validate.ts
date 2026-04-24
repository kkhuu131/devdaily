import type { Puzzle } from '../../src/types/puzzle';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

type RawQuestion = {
  id?: unknown;
  format?: unknown;
  difficulty?: unknown;
  prompt?: unknown;
  language?: unknown;
  options?: unknown;
  codeSnippet?: unknown;
};

type RawOption = {
  id?: unknown;
  text?: unknown;
  explanation?: unknown;
  isCorrect?: unknown;
};

function hasSingleCorrect(options: Array<{ isCorrect?: unknown }>): boolean {
  return options.filter((o) => o.isCorrect === true).length === 1;
}

export function validatePuzzleShape(raw: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObject(raw)) return { ok: false, errors: ['Puzzle is not an object'] };

  const puzzle = raw as Partial<Puzzle>;

  if (typeof puzzle.id !== 'number' || !Number.isInteger(puzzle.id) || puzzle.id < 1) {
    errors.push('id must be a positive integer');
  }
  if (typeof puzzle.conceptName !== 'string' || puzzle.conceptName.trim().length < 3) {
    errors.push('conceptName must be a non-empty string');
  }
  if (
    !['code-smell', 'solid', 'design-pattern', 'principle', 'refactoring'].includes(
      String(puzzle.category),
    )
  ) {
    errors.push('category is invalid');
  }
  if (typeof puzzle.definition !== 'string' || puzzle.definition.trim().length < 20) {
    errors.push('definition is too short');
  }
  if (typeof puzzle.ruleOfThumb !== 'string' || puzzle.ruleOfThumb.trim().length < 10) {
    errors.push('ruleOfThumb is too short');
  }
  const conceptLower = typeof puzzle.conceptName === 'string' ? puzzle.conceptName.trim().toLowerCase() : '';

  if (!isObject(puzzle.citation)) {
    errors.push('citation is missing');
  } else {
    const c = puzzle.citation as Record<string, unknown>;
    if (typeof c.author !== 'string' || !c.author.trim()) errors.push('citation.author missing');
    if (typeof c.bookTitle !== 'string' || !c.bookTitle.trim())
      errors.push('citation.bookTitle missing');
    if (typeof c.chapter !== 'string' || !c.chapter.trim()) errors.push('citation.chapter missing');
    if (typeof c.externalUrl !== 'string' || !/^https?:\/\//.test(c.externalUrl)) {
      errors.push('citation.externalUrl must be absolute http(s) url');
    }
  }

  if (!Array.isArray(puzzle.questions) || puzzle.questions.length !== 3) {
    errors.push('questions must contain exactly 3 items');
    return { ok: errors.length === 0, errors };
  }

  const expected = [
    { id: 1, format: 'multiple-choice', difficulty: 'easy' },
    { id: 2, format: 'multiple-choice', difficulty: 'medium' },
    { id: 3, format: 'which-one', difficulty: 'hard' },
  ] as const;

  for (let i = 0; i < puzzle.questions.length; i++) {
    const q = puzzle.questions[i] as RawQuestion;
    const exp = expected[i];
    if (!isObject(q)) {
      errors.push(`question ${i + 1} must be an object`);
      continue;
    }

    if (q.id !== exp.id) errors.push(`question ${i + 1} id must be ${exp.id}`);
    if (q.format !== exp.format) errors.push(`question ${i + 1} format must be ${exp.format}`);
    if (q.difficulty !== exp.difficulty) {
      errors.push(`question ${i + 1} difficulty must be ${exp.difficulty}`);
    }
    if (typeof q.prompt !== 'string' || q.prompt.trim().length < 10) {
      errors.push(`question ${i + 1} prompt is too short`);
    }
    if (q.language !== undefined && q.language !== null && q.language !== 'typescript') {
      errors.push(`question ${i + 1} language must be "typescript" when present`);
    }
    if (!Array.isArray(q.options)) {
      errors.push(`question ${i + 1} options missing`);
      continue;
    }

    const expectedIds = exp.format === 'which-one' ? ['a', 'b'] : ['a', 'b', 'c', 'd'];
    if (q.options.length !== expectedIds.length) {
      errors.push(`question ${i + 1} options must have ${expectedIds.length} entries`);
      continue;
    }

    const optionIds = q.options.map((o) => (o as RawOption).id);
    if (JSON.stringify(optionIds) !== JSON.stringify(expectedIds)) {
      errors.push(`question ${i + 1} option ids must be ${expectedIds.join(',')}`);
    }

    for (const opt of q.options) {
      if (typeof opt.text !== 'string' || opt.text.trim().length < 8) {
        errors.push(`question ${i + 1} has an option with short text`);
      }
      if (typeof opt.explanation !== 'string' || opt.explanation.trim().length < 12) {
        errors.push(`question ${i + 1} has an option with short explanation`);
      }
      if (conceptLower && typeof opt.text === 'string' && opt.text.toLowerCase().includes(conceptLower)) {
        errors.push(`question ${i + 1} option text leaks concept name`);
      }
    }

    if (!hasSingleCorrect(q.options)) {
      errors.push(`question ${i + 1} must have exactly one correct option`);
    }

    if (exp.format === 'which-one') {
      if (typeof q.codeSnippet !== 'string' || q.codeSnippet.trim().length < 20) {
        errors.push('question 3 should include a meaningful comparison code snippet');
      }
      const snippet = typeof q.codeSnippet === 'string' ? q.codeSnippet.toLowerCase() : '';
      if (!(snippet.includes('version a') && snippet.includes('version b'))) {
        errors.push('question 3 snippet should compare Version A and Version B');
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

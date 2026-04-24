import type { Puzzle } from '../../src/types/puzzle';
import type { ManifestConcept } from './types';

export function normalizeConceptKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function hasConceptConflict(
  conceptName: string,
  existingPuzzles: Puzzle[],
  existingConcepts: ManifestConcept[],
): string | null {
  const key = normalizeConceptKey(conceptName);
  const keySet = new Set(existingConcepts.map((c) => c.conceptKey));
  if (keySet.has(key)) return `concept key already exists: ${key}`;

  const lower = conceptName.trim().toLowerCase();
  const existingName = existingPuzzles.find((p) => p.conceptName.trim().toLowerCase() === lower);
  if (existingName) return `concept name already used by puzzle id ${existingName.id}`;

  return null;
}

function tokenSet(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const intersection = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

export function findSemanticNearDuplicate(
  candidate: Pick<Puzzle, 'definition' | 'ruleOfThumb'>,
  existing: Puzzle[],
  threshold = 0.72,
): { puzzleId: number; score: number } | null {
  const candidateTokens = tokenSet(`${candidate.definition} ${candidate.ruleOfThumb}`);

  let best: { puzzleId: number; score: number } | null = null;
  for (const puzzle of existing) {
    const score = jaccard(
      candidateTokens,
      tokenSet(`${puzzle.definition} ${puzzle.ruleOfThumb}`),
    );
    if (score >= threshold && (!best || score > best.score)) {
      best = { puzzleId: puzzle.id, score };
    }
  }

  return best;
}

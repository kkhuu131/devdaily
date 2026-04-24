import type { Category, Puzzle } from '../../src/types/puzzle';

export interface PipelineConfig {
  version: number;
  generation: {
    defaultBatchSize: number;
    maxBatchSize: number;
    targetDaysAheadBuffer: number;
    scheduleCronUtc: string;
  };
  rotation: {
    policy: 'no-repeat-until-exhausted';
    seasonRepeatGapDays: number;
    activeSeasonId: string;
  };
  mixTargets: Record<Category, number>;
  quality: {
    requireDifficultyOrder: boolean;
    requireSingleCorrectOptionForMcAndWhichOne: boolean;
    maxConceptNameLength: number;
  };
}

export interface ManifestConcept {
  conceptKey: string;
  conceptName: string;
  category: Category;
  firstPuzzleId: number;
  lastPuzzleId: number;
  usageCount: number;
  lastUsedSeasonId: string;
}

export interface ManifestSeason {
  id: string;
  label: string;
  status: 'active' | 'closed' | 'planned';
  puzzleIds: number[];
}

export interface PuzzleManifest {
  version: number;
  generatedAtUtc: string;
  seasons: ManifestSeason[];
  concepts: ManifestConcept[];
}

export interface GenerationCandidate {
  conceptKey: string;
  conceptName: string;
  category: Category;
}

export type GeneratedPuzzle = Puzzle;

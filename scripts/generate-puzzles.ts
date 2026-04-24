import fs from 'fs/promises';
import path from 'path';
import type { Category, Puzzle } from '../src/types/puzzle';
import { getDayNumber } from '../src/lib/puzzle';
import { normalizeConceptKey, hasConceptConflict, findSemanticNearDuplicate } from './lib/dedupe';
import { buildSystemPrompt, buildUserPrompt } from './lib/prompt';
import { validatePuzzleShape } from './lib/validate';
import type {
  GeneratedPuzzle,
  GenerationCandidate,
  ManifestConcept,
  PipelineConfig,
  PuzzleManifest,
} from './lib/types';

type CliArgs = {
  count?: number;
  dryRun: boolean;
  seed: number;
  startDay?: number;
};

const ROOT = process.cwd();
const PUZZLES_DIR = path.join(ROOT, 'content', 'puzzles');
const MANIFEST_PATH = path.join(ROOT, 'content', 'puzzle-manifest.json');
const CONFIG_PATH = path.join(ROOT, 'config', 'puzzle-pipeline.json');

async function loadLocalEnvIfPresent(): Promise<void> {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const target = path.join(ROOT, file);
    try {
      const raw = await fs.readFile(target, 'utf-8');
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx <= 0) continue;
        const key = trimmed.slice(0, idx).trim();
        if (!key || process.env[key] !== undefined) continue;
        const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = value;
      }
    } catch {
      // ignore missing local env files
    }
  }
}

const MODEL = process.env.OPENAI_PUZZLE_MODEL || 'gpt-5-mini';

const MODEL_PRICING_USD_PER_1M_TOKENS: Record<
  string,
  { input: number; output: number }
> = {
  'gpt-5-mini': { input: 0.25, output: 2.0 },
  'gpt-5.4-mini': { input: 0.75, output: 4.5 },
  'gpt-4.1-mini': { input: 0.4, output: 1.6 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
};

const PUZZLE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'id',
    'conceptName',
    'category',
    'definition',
    'ruleOfThumb',
    'citation',
    'questions',
  ],
  properties: {
    id: { type: 'integer' },
    conceptName: { type: 'string' },
    category: {
      type: 'string',
      enum: ['code-smell', 'solid', 'design-pattern', 'principle', 'refactoring'],
    },
    definition: { type: 'string' },
    ruleOfThumb: { type: 'string' },
    citation: {
      type: 'object',
      additionalProperties: false,
      required: ['author', 'bookTitle', 'chapter', 'page', 'externalUrl'],
      properties: {
        author: { type: 'string' },
        bookTitle: { type: 'string' },
        chapter: { type: 'string' },
        page: { type: ['string', 'null'] },
        externalUrl: { type: 'string' },
      },
    },
    questions: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'format', 'difficulty', 'prompt', 'codeSnippet', 'language', 'options'],
        properties: {
          id: { type: 'integer' },
          format: {
            type: 'string',
            enum: ['multiple-choice', 'which-one', 'true-false'],
          },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          prompt: { type: 'string' },
          codeSnippet: { type: ['string', 'null'] },
          language: { type: ['string', 'null'] },
          options: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['id', 'text', 'isCorrect', 'explanation'],
              properties: {
                id: { type: 'string', enum: ['a', 'b', 'c', 'd'] },
                text: { type: 'string' },
                isCorrect: { type: 'boolean' },
                explanation: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
} as const;

const CONCEPT_CATALOG: GenerationCandidate[] = [
  { conceptKey: 'message-chains', conceptName: 'Message Chains', category: 'code-smell' },
  { conceptKey: 'middle-man', conceptName: 'Middle Man', category: 'code-smell' },
  { conceptKey: 'temporary-field', conceptName: 'Temporary Field', category: 'code-smell' },
  { conceptKey: 'parallel-inheritance-hierarchies', conceptName: 'Parallel Inheritance Hierarchies', category: 'code-smell' },
  { conceptKey: 'inappropriate-intimacy', conceptName: 'Inappropriate Intimacy', category: 'code-smell' },
  { conceptKey: 'speculative-generality', conceptName: 'Speculative Generality', category: 'code-smell' },
  { conceptKey: 'command-query-separation', conceptName: 'Command-Query Separation', category: 'principle' },
  { conceptKey: 'fail-fast-principle', conceptName: 'Fail Fast Principle', category: 'principle' },
  { conceptKey: 'encapsulate-what-varies', conceptName: 'Encapsulate What Varies', category: 'principle' },
  { conceptKey: 'least-astonishment', conceptName: 'Principle of Least Astonishment', category: 'principle' },
  { conceptKey: 'you-aint-gonna-need-it', conceptName: 'YAGNI', category: 'principle' },
  { conceptKey: 'k-i-s-s-principle', conceptName: 'KISS Principle', category: 'principle' },
  { conceptKey: 'dependency-injection', conceptName: 'Dependency Injection', category: 'solid' },
  { conceptKey: 'information-hiding', conceptName: 'Information Hiding', category: 'solid' },
  { conceptKey: 'bridge-pattern', conceptName: 'Bridge Pattern', category: 'design-pattern' },
  { conceptKey: 'decorator-pattern', conceptName: 'Decorator Pattern', category: 'design-pattern' },
  { conceptKey: 'state-pattern', conceptName: 'State Pattern', category: 'design-pattern' },
  { conceptKey: 'builder-pattern', conceptName: 'Builder Pattern', category: 'design-pattern' },
  { conceptKey: 'proxy-pattern', conceptName: 'Proxy Pattern', category: 'design-pattern' },
  { conceptKey: 'singleton-pattern', conceptName: 'Singleton Pattern', category: 'design-pattern' },
  { conceptKey: 'extract-function', conceptName: 'Extract Function', category: 'refactoring' },
  { conceptKey: 'replace-conditional-with-polymorphism', conceptName: 'Replace Conditional with Polymorphism', category: 'refactoring' },
  { conceptKey: 'introduce-parameter-object', conceptName: 'Introduce Parameter Object', category: 'refactoring' },
  { conceptKey: 'move-method', conceptName: 'Move Method', category: 'refactoring' },
];

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { dryRun: false, seed: Date.now() };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--count') args.count = Number(argv[++i]);
    else if (token === '--dry-run') args.dryRun = true;
    else if (token === '--seed') args.seed = Number(argv[++i]);
    else if (token === '--start-day') args.startDay = Number(argv[++i]);
  }
  return args;
}

function createSeededRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted<T extends string>(weights: Record<T, number>, rng: () => number): T {
  const entries = Object.entries(weights) as Array<[T, number]>;
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  const target = rng() * total;
  let acc = 0;
  for (const [key, weight] of entries) {
    acc += weight;
    if (target <= acc) return key;
  }
  return entries[entries.length - 1][0];
}

async function readJson<T>(target: string): Promise<T> {
  const raw = (await fs.readFile(target, 'utf-8')).replace(/^﻿/, '');
  return JSON.parse(raw) as T;
}

async function readExistingPuzzles(): Promise<Puzzle[]> {
  const files = (await fs.readdir(PUZZLES_DIR)).filter((f) => f.endsWith('.json')).sort();
  const puzzles: Puzzle[] = [];
  for (const file of files) {
    const puzzle = await readJson<Puzzle>(path.join(PUZZLES_DIR, file));
    puzzles.push(puzzle);
  }
  return puzzles.sort((a, b) => a.id - b.id);
}

function getActiveSeason(manifest: PuzzleManifest, activeSeasonId: string) {
  const season = manifest.seasons.find((s) => s.id === activeSeasonId);
  if (!season) throw new Error(`Active season "${activeSeasonId}" not found in manifest`);
  return season;
}

function chooseConcept(
  category: Category,
  manifest: PuzzleManifest,
  config: PipelineConfig,
  generatedInRun: Set<string>,
  nextPuzzleId: number,
): GenerationCandidate | null {
  const known = new Set(manifest.concepts.map((c) => c.conceptKey));
  const unused = CONCEPT_CATALOG.filter(
    (c) => c.category === category && !known.has(c.conceptKey) && !generatedInRun.has(c.conceptKey),
  );
  if (unused.length > 0) return unused[0];

  // No-repeat-until-exhausted: after pool exhaustion, enforce spacing policy for controlled reuse.
  const spacing = config.rotation.seasonRepeatGapDays;
  const reusable = manifest.concepts
    .filter((c) => c.category === category && !generatedInRun.has(c.conceptKey))
    .filter((c) => nextPuzzleId - c.lastPuzzleId >= spacing)
    .sort((a, b) => a.lastPuzzleId - b.lastPuzzleId);

  if (reusable.length > 0) {
    const choice = reusable[0];
    return {
      conceptKey: choice.conceptKey,
      conceptName: choice.conceptName,
      category: choice.category,
    };
  }

  return null;
}

async function callOpenAiForPuzzle(input: {
  conceptName: string;
  conceptKey: string;
  category: Category;
  forcedWhichOneCorrectOption: 'a' | 'b';
}): Promise<{
  parsed: unknown;
  usage?:
    | {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      }
    | undefined;
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for non-dry generation');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'devdaily_puzzle',
          strict: true,
          schema: PUZZLE_JSON_SCHEMA,
        },
      },
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(input) },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${response.statusText} :: ${body}`);
  }

  const data = (await response.json()) as any;
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error('OpenAI response missing JSON string content');
  return {
    parsed: JSON.parse(content),
    usage: data?.usage as
      | {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        }
      | undefined,
  };
}

function createDryRunPuzzle(input: {
  id: number;
  conceptName: string;
  category: Category;
  forcedWhichOneCorrectOption: 'a' | 'b';
}): Puzzle {
  const q3CorrectA = input.forcedWhichOneCorrectOption === 'a';
  return {
    id: input.id,
    conceptName: input.conceptName,
    category: input.category,
    definition: `${input.conceptName} definition placeholder generated in dry-run mode.`,
    ruleOfThumb: `Use ${input.conceptName} intentionally to reduce accidental complexity.`,
    citation: {
      author: 'Dry Run',
      bookTitle: 'N/A',
      chapter: 'N/A',
      externalUrl: 'https://example.com',
    },
    questions: [
      {
        id: 1,
        format: 'multiple-choice',
        difficulty: 'easy',
        prompt: `Which statement best captures ${input.conceptName}?`,
        language: 'typescript',
        codeSnippet: 'class Example {}',
        options: [
          { id: 'a', text: 'Correct option', isCorrect: true, explanation: 'Correct in dry-run.' },
          { id: 'b', text: 'Distractor one', isCorrect: false, explanation: 'Incorrect in dry-run.' },
          { id: 'c', text: 'Distractor two', isCorrect: false, explanation: 'Incorrect in dry-run.' },
          { id: 'd', text: 'Distractor three', isCorrect: false, explanation: 'Incorrect in dry-run.' },
        ],
      },
      {
        id: 2,
        format: 'multiple-choice',
        difficulty: 'medium',
        prompt: `When should ${input.conceptName} be preferred?`,
        language: 'typescript',
        codeSnippet: 'function sample() {}',
        options: [
          { id: 'a', text: 'Correct option', isCorrect: true, explanation: 'Correct in dry-run.' },
          { id: 'b', text: 'Distractor one', isCorrect: false, explanation: 'Incorrect in dry-run.' },
          { id: 'c', text: 'Distractor two', isCorrect: false, explanation: 'Incorrect in dry-run.' },
          { id: 'd', text: 'Distractor three', isCorrect: false, explanation: 'Incorrect in dry-run.' },
        ],
      },
      {
        id: 3,
        format: 'which-one',
        difficulty: 'hard',
        prompt: 'Which version better preserves the intended design?',
        language: 'typescript',
        codeSnippet:
          '// Version A\nfunction versionA() { /* design A */ }\n// Version B\nfunction versionB() { /* design B */ }',
        options: [
          {
            id: 'a',
            text: 'Version A rationale',
            isCorrect: q3CorrectA,
            explanation: q3CorrectA ? 'Correct in dry-run.' : 'Incorrect in dry-run.',
          },
          {
            id: 'b',
            text: 'Version B rationale',
            isCorrect: !q3CorrectA,
            explanation: q3CorrectA ? 'Incorrect in dry-run.' : 'Correct in dry-run.',
          },
        ],
      },
    ],
  };
}

function updateManifestConcept(
  existingConcepts: ManifestConcept[],
  puzzle: Puzzle,
  seasonId: string,
): ManifestConcept[] {
  const conceptKey = normalizeConceptKey(puzzle.conceptName);
  const existing = existingConcepts.find((c) => c.conceptKey === conceptKey);
  if (!existing) {
    return [
      ...existingConcepts,
      {
        conceptKey,
        conceptName: puzzle.conceptName,
        category: puzzle.category,
        firstPuzzleId: puzzle.id,
        lastPuzzleId: puzzle.id,
        usageCount: 1,
        lastUsedSeasonId: seasonId,
      },
    ];
  }

  return existingConcepts.map((c) =>
    c.conceptKey === conceptKey
      ? {
          ...c,
          conceptName: puzzle.conceptName,
          lastPuzzleId: puzzle.id,
          usageCount: c.usageCount + 1,
          lastUsedSeasonId: seasonId,
        }
      : c,
  );
}

function formatPuzzleFileName(id: number, conceptName: string): string {
  return `${String(id).padStart(3, '0')}-${normalizeConceptKey(conceptName)}.json`;
}

function normalizeGeneratedPuzzle(puzzle: Puzzle): Puzzle {
  const normalizedQuestions = puzzle.questions.map((q) => {
    const next = { ...q };
    if (next.language === null) {
      next.language = undefined;
    } else if (next.language !== undefined) {
      const lang = String(next.language).trim().toLowerCase();
      next.language =
        lang === 'typescript' || lang === 'ts' || lang === 'tsx' ? 'typescript' : undefined;
    }
    return next;
  }) as Puzzle['questions'];

  return {
    ...puzzle,
    questions: normalizedQuestions,
  };
}

async function main() {
  await loadLocalEnvIfPresent();

  const args = parseArgs(process.argv.slice(2));
  const config = await readJson<PipelineConfig>(CONFIG_PATH);
  const manifest = await readJson<PuzzleManifest>(MANIFEST_PATH);
  const existing = await readExistingPuzzles();

  const currentDayNumber = getDayNumber(new Date());
  const daysAhead = existing.length - currentDayNumber;
  const bufferGap = config.generation.targetDaysAheadBuffer - daysAhead;

  const count =
    args.count !== undefined
      ? args.count
      : bufferGap > 0
        ? Math.min(bufferGap, config.generation.maxBatchSize)
        : 0;

  if (count === 0) {
    console.log(
      JSON.stringify(
        {
          skipped: true,
          reason: 'days-ahead-buffer-satisfied',
          model: args.dryRun ? 'none (dry-run template)' : MODEL,
          currentDayNumber,
          existingPuzzleCount: existing.length,
          daysAhead,
          targetDaysAheadBuffer: config.generation.targetDaysAheadBuffer,
          requestedCount: args.count ?? null,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (!Number.isFinite(count) || count < 1 || count > config.generation.maxBatchSize) {
    throw new Error(
      `--count must be between 1 and ${config.generation.maxBatchSize}. Received: ${count}`,
    );
  }

  const rng = createSeededRng(args.seed);
  const activeSeason = getActiveSeason(manifest, config.rotation.activeSeasonId);
  let nextPuzzleId = Math.max(0, ...existing.map((p) => p.id)) + 1;

  const generated: GeneratedPuzzle[] = [];
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  const generatedKeys = new Set<string>();
  const report: Array<{
    id: number;
    conceptName: string;
    conceptKey: string;
    category: Category;
    whichOneCorrect: 'a' | 'b';
  }> = [];

  for (let i = 0; i < count; i++) {
    const desiredCategory = pickWeighted(config.mixTargets, rng);
    const categories: Category[] = [
      desiredCategory,
      'design-pattern',
      'code-smell',
      'principle',
      'refactoring',
      'solid',
    ];

    let candidate: GenerationCandidate | null = null;
    for (const category of categories) {
      candidate = chooseConcept(category, manifest, config, generatedKeys, nextPuzzleId);
      if (candidate) break;
    }

    if (!candidate) {
      throw new Error(
        'No eligible concepts remain for generation. Expand concept catalog or relax spacing policy.',
      );
    }
    generatedKeys.add(candidate.conceptKey);

    const whichOneCorrect = rng() < 0.5 ? 'a' : 'b';
    const generationResult: {
      parsed: unknown;
      usage?:
        | {
            prompt_tokens?: number;
            completion_tokens?: number;
            total_tokens?: number;
          }
        | undefined;
    } = args.dryRun
      ? {
          parsed: createDryRunPuzzle({
            id: nextPuzzleId,
            conceptName: candidate.conceptName,
            category: candidate.category,
            forcedWhichOneCorrectOption: whichOneCorrect,
          }),
        }
      : await callOpenAiForPuzzle({
          conceptName: candidate.conceptName,
          conceptKey: candidate.conceptKey,
          category: candidate.category,
          forcedWhichOneCorrectOption: whichOneCorrect,
        });

    const raw = generationResult.parsed;
    if (typeof raw !== 'object' || raw === null) {
      throw new Error(`Generated payload for id ${nextPuzzleId} is not an object`);
    }

    if (!args.dryRun) {
      totalPromptTokens += generationResult.usage?.prompt_tokens ?? 0;
      totalCompletionTokens += generationResult.usage?.completion_tokens ?? 0;
    }

    const puzzle = raw as Puzzle;
    puzzle.id = nextPuzzleId;
    puzzle.category = candidate.category;
    puzzle.conceptName = candidate.conceptName;
    const normalizedPuzzle = normalizeGeneratedPuzzle(puzzle);

    const shapeValidation = validatePuzzleShape(normalizedPuzzle);
    if (!shapeValidation.ok) {
      throw new Error(
        `Validation failed for generated puzzle #${nextPuzzleId}: ${shapeValidation.errors.join('; ')}`,
      );
    }

    const conflict = hasConceptConflict(
      normalizedPuzzle.conceptName,
      [...existing, ...generated],
      manifest.concepts,
    );
    if (conflict) {
      throw new Error(`Deduplication failed for generated puzzle #${nextPuzzleId}: ${conflict}`);
    }

    if (!args.dryRun) {
      const semantic = findSemanticNearDuplicate(normalizedPuzzle, [...existing, ...generated]);
      if (semantic) {
        throw new Error(
          `Semantic near-duplicate detected for puzzle #${nextPuzzleId} (similar to #${semantic.puzzleId}, score=${semantic.score.toFixed(2)})`,
        );
      }
    }

    generated.push(normalizedPuzzle);
    report.push({
      id: normalizedPuzzle.id,
      conceptName: normalizedPuzzle.conceptName,
      conceptKey: normalizeConceptKey(normalizedPuzzle.conceptName),
      category: normalizedPuzzle.category,
      whichOneCorrect,
    });

    nextPuzzleId += 1;
  }

  if (!args.dryRun) {
    for (const puzzle of generated) {
      const filePath = path.join(PUZZLES_DIR, formatPuzzleFileName(puzzle.id, puzzle.conceptName));
      await fs.writeFile(filePath, `${JSON.stringify(puzzle, null, 2)}\n`, 'utf-8');

      activeSeason.puzzleIds.push(puzzle.id);
      manifest.concepts = updateManifestConcept(manifest.concepts, puzzle, activeSeason.id);
    }

    manifest.generatedAtUtc = new Date().toISOString();
    await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
  }

  const pricing = MODEL_PRICING_USD_PER_1M_TOKENS[MODEL];
  const estimatedCostUsd =
    args.dryRun || !pricing
      ? null
      : Number(
          (
            (totalPromptTokens / 1_000_000) * pricing.input +
            (totalCompletionTokens / 1_000_000) * pricing.output
          ).toFixed(6),
        );

  const summary = {
    dryRun: args.dryRun,
    skipped: false,
    count: generated.length,
    seed: args.seed,
    startDay: args.startDay ?? null,
    model: args.dryRun ? 'none (dry-run template)' : MODEL,
    currentDayNumber,
    existingPuzzleCount: existing.length,
    daysAheadBeforeRun: daysAhead,
    targetDaysAheadBuffer: config.generation.targetDaysAheadBuffer,
    usage: {
      promptTokens: args.dryRun ? null : totalPromptTokens,
      completionTokens: args.dryRun ? null : totalCompletionTokens,
      totalTokens: args.dryRun ? null : totalPromptTokens + totalCompletionTokens,
    },
    estimatedCostUsd,
    generated: report,
  };

  // Report output is intentionally JSON so CI artifacts are machine-parseable.
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

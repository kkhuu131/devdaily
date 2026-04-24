import fs from 'fs';
import path from 'path';
import type { Puzzle } from '@/types/puzzle';

// Server-only — do not import from Client Components.

// Update this when the game officially launches.
const LAUNCH_DATE_UTC = Date.UTC(2026, 3, 23); // 2026-04-23

/** Day index since launch; advances at 00:00 UTC (same boundary as `/api/puzzle` and client storage date keys). */
export function getDayNumber(date: Date): number {
  const dateMs = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  return Math.max(1, Math.floor((dateMs - LAUNCH_DATE_UTC) / (1000 * 60 * 60 * 24)) + 1);
}

export function getAllPuzzles(): Puzzle[] {
  const puzzlesDir = path.join(process.cwd(), 'content', 'puzzles');
  const files = fs
    .readdirSync(puzzlesDir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  const puzzles = files.map((file) => {
    const raw = fs.readFileSync(path.join(puzzlesDir, file), 'utf-8').replace(/^﻿/, '');
    return JSON.parse(raw) as Puzzle;
  });

  return applyManifestRotation(puzzles);
}

export function getPuzzleForDate(date: Date): Puzzle {
  const puzzles = getAllPuzzles();
  if (puzzles.length === 0) throw new Error('No puzzles found');
  const dayNumber = getDayNumber(date);
  const index = (dayNumber - 1) % puzzles.length;
  return puzzles[index];
}

export function getPuzzleByIndex(index: number): Puzzle {
  const puzzles = getAllPuzzles();
  if (puzzles.length === 0) throw new Error('No puzzles found');
  return puzzles[((index % puzzles.length) + puzzles.length) % puzzles.length];
}

interface PuzzleManifest {
  seasons?: Array<{
    id: string;
    label?: string;
    status?: 'active' | 'closed' | 'planned';
    puzzleIds?: number[];
  }>;
}

function readPuzzleManifest(): PuzzleManifest | null {
  try {
    const target = path.join(process.cwd(), 'content', 'puzzle-manifest.json');
    const raw = fs.readFileSync(target, 'utf-8').replace(/^﻿/, '');
    return JSON.parse(raw) as PuzzleManifest;
  } catch {
    return null;
  }
}

function applyManifestRotation(puzzles: Puzzle[]): Puzzle[] {
  const manifest = readPuzzleManifest();
  const seasons = manifest?.seasons;
  if (!seasons || seasons.length === 0) return puzzles;

  const byId = new Map<number, Puzzle>(puzzles.map((p) => [p.id, p]));
  const orderedIds = seasons
    .filter((s) => s.status !== 'planned')
    .flatMap((s) => s.puzzleIds ?? []);

  if (orderedIds.length === 0) return puzzles;

  const ordered = orderedIds
    .map((id) => byId.get(id))
    .filter((p): p is Puzzle => Boolean(p));

  // Keep any untracked puzzle ids at the end for resilience.
  const tracked = new Set(ordered.map((p) => p.id));
  const untracked = puzzles.filter((p) => !tracked.has(p.id)).sort((a, b) => a.id - b.id);

  return [...ordered, ...untracked];
}

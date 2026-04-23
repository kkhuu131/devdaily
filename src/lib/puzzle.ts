import fs from 'fs';
import path from 'path';
import type { Puzzle } from '@/types/puzzle';

// Server-only — do not import from Client Components.

// Update this when the game officially launches.
const LAUNCH_DATE_UTC = Date.UTC(2025, 0, 1); // 2025-01-01

function getDaysSinceEpoch(date: Date): number {
  const epochMs = Date.UTC(1970, 0, 1);
  const dateMs = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((dateMs - epochMs) / (1000 * 60 * 60 * 24));
}

export function getDayNumber(date: Date): number {
  const dateMs = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.max(1, Math.floor((dateMs - LAUNCH_DATE_UTC) / (1000 * 60 * 60 * 24)) + 1);
}

export function getAllPuzzles(): Puzzle[] {
  const puzzlesDir = path.join(process.cwd(), 'content', 'puzzles');
  const files = fs
    .readdirSync(puzzlesDir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(puzzlesDir, file), 'utf-8');
    return JSON.parse(raw) as Puzzle;
  });
}

export function getPuzzleForDate(date: Date): Puzzle {
  const puzzles = getAllPuzzles();
  if (puzzles.length === 0) throw new Error('No puzzles found');
  const index = getDaysSinceEpoch(date) % puzzles.length;
  return puzzles[index];
}

export function getPuzzleByIndex(index: number): Puzzle {
  const puzzles = getAllPuzzles();
  if (puzzles.length === 0) throw new Error('No puzzles found');
  return puzzles[((index % puzzles.length) + puzzles.length) % puzzles.length];
}

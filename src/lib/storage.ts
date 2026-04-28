import type { StoredGameState, StreakState, StatsState } from '@/types/puzzle';
import { getUtcPuzzleDateKey } from '@/lib/daily-calendar';

const STORAGE_KEY = 'devdaily_game_state';
const STREAK_STORAGE_KEY = 'devdaily_streak_state';
const DAY_MS = 1000 * 60 * 60 * 24;

export function getStoredGameState(): StoredGameState | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const stored = JSON.parse(raw) as StoredGameState;

    if (stored.date !== getUtcPuzzleDateKey()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return stored;
  } catch {
    return null;
  }
}

export function saveGameState(state: StoredGameState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearGameState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

function parseUtcDateKey(key: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return Date.UTC(year, month - 1, day);
}

function dayDiff(fromDateKey: string, toDateKey: string): number | null {
  const fromMs = parseUtcDateKey(fromDateKey);
  const toMs = parseUtcDateKey(toDateKey);
  if (fromMs === null || toMs === null) return null;
  return Math.floor((toMs - fromMs) / DAY_MS);
}

function normalizeStreakForToday(streak: StreakState, todayKey: string): StreakState {
  if (!streak.lastCompletedDate) {
    return { current: 0, lastCompletedDate: null };
  }

  const diff = dayDiff(streak.lastCompletedDate, todayKey);
  if (diff === null) {
    return { current: 0, lastCompletedDate: null };
  }

  if (diff <= 1) {
    return {
      current: Math.max(0, streak.current),
      lastCompletedDate: streak.lastCompletedDate,
    };
  }

  return { current: 0, lastCompletedDate: null };
}

function readRawStreakState(): StreakState {
  if (typeof window === 'undefined') return { current: 0, lastCompletedDate: null };

  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) return { current: 0, lastCompletedDate: null };

    const parsed = JSON.parse(raw) as Partial<StreakState>;
    return {
      current: typeof parsed.current === 'number' ? parsed.current : 0,
      lastCompletedDate:
        typeof parsed.lastCompletedDate === 'string' ? parsed.lastCompletedDate : null,
    };
  } catch {
    return { current: 0, lastCompletedDate: null };
  }
}

function saveStreakState(streak: StreakState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
  } catch {
    // ignore quota or blocked-storage errors
  }
}

export function getCurrentStreak(todayKey: string = getUtcPuzzleDateKey()): number {
  const normalized = normalizeStreakForToday(readRawStreakState(), todayKey);
  saveStreakState(normalized);
  return normalized.current;
}

export function recordDailyCompletion(todayKey: string = getUtcPuzzleDateKey()): number {
  const normalized = normalizeStreakForToday(readRawStreakState(), todayKey);

  if (normalized.lastCompletedDate === todayKey) {
    saveStreakState(normalized);
    return normalized.current;
  }

  const diff = normalized.lastCompletedDate
    ? dayDiff(normalized.lastCompletedDate, todayKey)
    : null;

  const next: StreakState =
    diff === 1
      ? { current: normalized.current + 1, lastCompletedDate: todayKey }
      : { current: 1, lastCompletedDate: todayKey };

  saveStreakState(next);
  return next.current;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

const STATS_STORAGE_KEY = 'devdaily_stats';

function defaultStats(): StatsState {
  return { played: 0, distribution: [0, 0, 0, 0], bestStreak: 0, lastRecordedDate: null };
}

function readRawStatsState(): StatsState {
  if (typeof window === 'undefined') return defaultStats();
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return defaultStats();
    const parsed = JSON.parse(raw) as Partial<StatsState>;
    return {
      played: typeof parsed.played === 'number' ? parsed.played : 0,
      distribution:
        Array.isArray(parsed.distribution) && parsed.distribution.length === 4
          ? (parsed.distribution as [number, number, number, number])
          : [0, 0, 0, 0],
      bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : 0,
      lastRecordedDate:
        typeof parsed.lastRecordedDate === 'string' ? parsed.lastRecordedDate : null,
    };
  } catch {
    return defaultStats();
  }
}

export function getStats(): StatsState {
  return readRawStatsState();
}

export function recordCompletionStats(
  score: number,
  currentStreak: number,
  todayKey: string = getUtcPuzzleDateKey(),
): StatsState {
  const stats = readRawStatsState();
  if (stats.lastRecordedDate === todayKey) return stats;

  const s = Math.max(0, Math.min(3, Math.floor(score))) as 0 | 1 | 2 | 3;
  const dist: [number, number, number, number] = [...stats.distribution] as [number, number, number, number];
  dist[s] += 1;

  const updated: StatsState = {
    played: stats.played + 1,
    distribution: dist,
    bestStreak: Math.max(stats.bestStreak, currentStreak),
    lastRecordedDate: todayKey,
  };

  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore quota errors
  }

  return updated;
}

import type { StoredGameState } from '@/types/puzzle';
import { getUtcPuzzleDateKey } from '@/lib/daily-calendar';

const STORAGE_KEY = 'devdaily_game_state';

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

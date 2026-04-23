import type { StoredGameState } from '@/types/puzzle';

const STORAGE_KEY = 'devdaily_game_state';

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getStoredGameState(): StoredGameState | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const stored = JSON.parse(raw) as StoredGameState;

    if (stored.date !== getTodayDateString()) {
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

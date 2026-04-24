/**
 * Single source of truth for the "daily puzzle" calendar boundary.
 * Matches `getDayNumber()` in `puzzle.ts`: UTC calendar date (not the viewer's local timezone).
 */

export function getUtcPuzzleDateKey(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMsUntilNextUtcMidnight(now: number = Date.now()): number {
  const d = new Date(now);
  const nextUtcMidnight = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate() + 1,
  );
  return nextUtcMidnight - now;
}

export function formatCountdownHms(totalMs: number): string {
  const s = Math.max(0, Math.floor(totalMs / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const z = (n: number) => String(n).padStart(2, '0');
  return `${z(h)}:${z(m)}:${z(sec)}`;
}

/**
 * Single place for public site identity and URL resolution.
 * Canonical deploy: https://playdevdaily.vercel.app
 * Override with NEXT_PUBLIC_SITE_URL when you add a custom domain.
 * On Vercel, VERCEL_URL is used before the canonical fallback when the public URL is unset.
 */

/** Public production URL (no trailing slash). */
export const CANONICAL_SITE_URL = 'https://playdevdaily.vercel.app';

export const SITE_NAME = 'DevDaily';

export const SITE_TAGLINE = 'Daily software craft puzzles';

export const SITE_DESCRIPTION =
  'A daily puzzle game for developers. Three questions on one concept—code smells, design patterns, SOLID, and refactoring—with code snippets and a reveal. Same puzzle for everyone each UTC day.';

/** Optional: comma-separated hints for crawlers (Google largely ignores keywords). */
export const SITE_KEYWORDS = [
  'developer puzzle',
  'code smell quiz',
  'SOLID principles',
  'design patterns',
  'refactoring',
  'software craft',
  'daily coding challenge',
].join(', ');

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;

  if (process.env.NODE_ENV === 'production') {
    return CANONICAL_SITE_URL;
  }

  return 'http://localhost:3000';
}

/**
 * Clipboard / share lines from Client Components: NEXT_PUBLIC_SITE_URL at build time, else canonical.
 * (VERCEL_URL is not available in the browser.)
 */
export function getShareSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  return CANONICAL_SITE_URL;
}

export function getShareSiteHost(): string {
  try {
    return new URL(getShareSiteUrl()).host;
  } catch {
    return 'playdevdaily.vercel.app';
  }
}

/** Hostname for footer branding, or null on localhost. */
export function getSiteHostnameForDisplay(): string | null {
  try {
    const host = new URL(getSiteUrl()).hostname;
    if (host === 'localhost' || host === '127.0.0.1') return null;
    return host;
  } catch {
    return null;
  }
}

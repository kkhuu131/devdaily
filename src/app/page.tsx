import type { Metadata } from 'next';
import { getPuzzleForDate, getDayNumber } from '@/lib/puzzle';
import { highlightCode } from '@/lib/highlight';
import PuzzleSession from '@/components/puzzle/PuzzleSession';
import { SITE_NAME, SITE_TAGLINE, getSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    url: getSiteUrl(),
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  },
};

export default async function Page() {
  const today = new Date();
  const puzzle = getPuzzleForDate(today);
  const dayNumber = getDayNumber(today);

  const highlightedSnippets = await Promise.all(
    puzzle.questions.map((q) =>
      q.codeSnippet
        ? highlightCode(q.codeSnippet, q.language ?? 'typescript')
        : Promise.resolve(null),
    ),
  );

  return (
    <PuzzleSession
      puzzle={puzzle}
      dayNumber={dayNumber}
      highlightedSnippets={highlightedSnippets}
    />
  );
}

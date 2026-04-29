import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPuzzles, getDayNumber } from '@/lib/puzzle';
import { highlightCode } from '@/lib/highlight';
import ArchiveSession from '@/components/puzzle/ArchiveSession';
import { SITE_NAME } from '@/lib/site';

interface Props {
  params: Promise<{ day: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { day } = await params;
  const dayNumber = parseInt(day, 10);
  if (isNaN(dayNumber) || dayNumber < 1) {
    return { title: 'Archive' };
  }

  const todayDayNumber = getDayNumber(new Date());
  if (dayNumber >= todayDayNumber) {
    return { title: 'Archive' };
  }

  const allPuzzles = getAllPuzzles();
  if (allPuzzles.length === 0) {
    return { title: 'Archive' };
  }

  const puzzleIndex = (dayNumber - 1) % allPuzzles.length;
  const puzzle = allPuzzles[puzzleIndex];
  const title = `${puzzle.conceptName} (day ${dayNumber})`;
  const description = `Replay ${SITE_NAME} puzzle #${dayNumber}: ${puzzle.conceptName}. Three questions, one reveal. Archive play does not affect your streak.`;

  return {
    title,
    description,
    alternates: { canonical: `/archive/${dayNumber}` },
    openGraph: {
      url: `/archive/${dayNumber}`,
      title: `${puzzle.conceptName} · ${SITE_NAME}`,
      description,
    },
  };
}

export default async function ArchiveDayPage({ params }: Props) {
  const { day } = await params;
  const dayNumber = parseInt(day, 10);

  if (isNaN(dayNumber) || dayNumber < 1) notFound();

  const todayDayNumber = getDayNumber(new Date());

  // Today's puzzle lives at /, not in the archive.
  if (dayNumber >= todayDayNumber) notFound();

  const allPuzzles = getAllPuzzles();
  if (allPuzzles.length === 0) notFound();

  const puzzleIndex = (dayNumber - 1) % allPuzzles.length;
  const puzzle = allPuzzles[puzzleIndex];

  const highlightedSnippets = await Promise.all(
    puzzle.questions.map((q) =>
      q.codeSnippet
        ? highlightCode(q.codeSnippet, q.language ?? 'typescript')
        : Promise.resolve(null),
    ),
  );

  return (
    <ArchiveSession
      puzzle={puzzle}
      dayNumber={dayNumber}
      highlightedSnippets={highlightedSnippets}
    />
  );
}

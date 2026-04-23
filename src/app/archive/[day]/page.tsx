import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPuzzles, getDayNumber } from '@/lib/puzzle';
import { highlightCode } from '@/lib/highlight';
import ArchiveSession from '@/components/puzzle/ArchiveSession';

interface Props {
  params: Promise<{ day: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { day } = await params;
  const dayNumber = parseInt(day, 10);
  if (isNaN(dayNumber) || dayNumber < 1) {
    return { title: 'Archive — DevDaily' };
  }
  return { title: `DevDaily #${dayNumber} — Archive` };
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

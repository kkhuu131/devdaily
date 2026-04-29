import type { Metadata } from 'next';
import { getAllPuzzles, getDayNumber } from '@/lib/puzzle';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ArchiveList, { type ArchiveItem } from '@/components/archive/ArchiveList';

export const metadata: Metadata = {
  title: 'Archive',
  description:
    'Browse and replay every past daily puzzle (code smells, SOLID, design patterns, and refactoring) without affecting your streak.',
  alternates: { canonical: '/archive' },
  openGraph: { url: '/archive' },
};

export default function ArchivePage() {
  const today = new Date();
  const todayDayNumber = getDayNumber(today);
  const allPuzzles = getAllPuzzles();

  const items: ArchiveItem[] = Array.from(
    { length: todayDayNumber - 1 },
    (_, i) => {
      const dayNumber = todayDayNumber - 1 - i;
      const puzzle = allPuzzles[(dayNumber - 1) % allPuzzles.length];
      return {
        dayNumber,
        puzzleId: puzzle.id,
        conceptName: puzzle.conceptName,
        category: puzzle.category,
      };
    },
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header dayNumber={todayDayNumber} streak={0} />

      <main className="flex-1 px-4 max-w-[680px] mx-auto w-full pb-12">

        <div className="mb-8 pt-2">
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            archive
          </p>
          <h1
            className="text-sm tracking-widest uppercase mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            Past Puzzles
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Play any past puzzle without affecting your streak.
          </p>
        </div>

        {items.length === 0 ? (
          <div
            className="rounded-sm p-8 text-center"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              No past puzzles yet.
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              The archive grows one day at a time. Check back tomorrow.
            </p>
          </div>
        ) : (
          <ArchiveList items={items} />
        )}

      </main>

      <Footer />
    </div>
  );
}

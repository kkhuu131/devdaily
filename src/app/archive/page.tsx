import type { Metadata } from 'next';
import { getAllPuzzles, getDayNumber } from '@/lib/puzzle';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { Category } from '@/types/puzzle';

export const metadata: Metadata = {
  title: 'Archive — DevDaily',
  description: 'Every past DevDaily puzzle, playable without streak stakes.',
};

const CATEGORY_LABEL: Record<Category, string> = {
  'code-smell': 'smell',
  'solid': 'SOLID',
  'design-pattern': 'pattern',
  'principle': 'principle',
  'refactoring': 'refactoring',
};

export default function ArchivePage() {
  const today = new Date();
  const todayDayNumber = getDayNumber(today);
  const allPuzzles = getAllPuzzles();

  // Day numbers for every completed day, newest first.
  const pastDays = Array.from(
    { length: todayDayNumber - 1 },
    (_, i) => todayDayNumber - 1 - i,
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header dayNumber={todayDayNumber} streak={0} />

      <main className="flex-1 px-4 max-w-[640px] mx-auto w-full pb-12">

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

        {pastDays.length === 0 ? (
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
              The archive grows one day at a time — check back tomorrow.
            </p>
          </div>
        ) : (
          <div
            className="rounded-sm overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {pastDays.map((dayNumber, i) => {
              const puzzleIndex = (dayNumber - 1) % allPuzzles.length;
              const puzzle = allPuzzles[puzzleIndex];

              return (
                <div key={dayNumber}>
                  {i > 0 && (
                    <div
                      className="h-px"
                      style={{ backgroundColor: 'var(--border-subtle)' }}
                    />
                  )}
                  <a
                    href={`/archive/${dayNumber}`}
                    className="archive-row flex items-center gap-4 px-5 py-4"
                  >
                    <span
                      className="text-xs tabular-nums w-8 shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      #{dayNumber}
                    </span>
                    <span
                      className="archive-row-title flex-1 text-sm transition-colors duration-100"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {puzzle.conceptName}
                    </span>
                    <span
                      className="text-xs shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {CATEGORY_LABEL[puzzle.category]}
                    </span>
                    <span
                      className="text-xs shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      →
                    </span>
                  </a>
                </div>
              );
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

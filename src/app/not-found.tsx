import type { Metadata } from 'next';
import Link from 'next/link';
import { getDayNumber } from '@/lib/puzzle';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  const dayNumber = getDayNumber(new Date());

  return (
    <div className="flex flex-col min-h-screen">
      <Header dayNumber={dayNumber} />

      <main className="flex-1 flex items-center px-4 max-w-[680px] mx-auto w-full pb-12">
        <div className="w-full pt-8">
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            404
          </p>
          <h1
            className="text-3xl sm:text-4xl leading-tight mb-4"
            style={{
              fontFamily: 'var(--font-instrument-serif)',
              color: 'var(--accent-brand)',
              fontStyle: 'italic',
            }}
          >
            Page not found.
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            This page doesn&apos;t exist, but today&apos;s puzzle does.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex items-center justify-center py-2.5 min-h-11 rounded-sm text-sm transition-colors duration-150 px-5"
              style={{
                backgroundColor: 'var(--accent-brand)',
                color: 'var(--bg-base)',
                border: 'none',
                textDecoration: 'none',
              }}
            >
              Today&apos;s puzzle →
            </Link>
            <Link
              href="/archive"
              className="flex items-center justify-center py-2.5 min-h-11 rounded-sm text-sm transition-colors duration-150 px-5"
              style={{
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                textDecoration: 'none',
              }}
            >
              Browse archive
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

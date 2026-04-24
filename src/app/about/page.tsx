import type { Metadata } from 'next';
import { getDayNumber } from '@/lib/puzzle';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'A daily puzzle game for developers. Recognize code smells, design patterns, and SOLID principles through real scenarios.',
  alternates: { canonical: '/about' },
  openGraph: { url: '/about' },
};

const BOOKS = [
  {
    title: 'Refactoring',
    author: 'Martin Fowler',
    description:
      'The definitive catalog of code smells and the mechanics to systematically eliminate them.',
    url: 'https://martinfowler.com/books/refactoring.html',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    description:
      'Hands-on principles for writing code that communicates intent clearly — and exposes code that does not.',
    url: 'https://www.goodreads.com/book/show/3735293-clean-code',
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'David Thomas & Andrew Hunt',
    description:
      'Career-spanning wisdom on how professional developers think, adapt, and grow.',
    url: 'https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/',
  },
  {
    title: 'Design Patterns',
    author: 'Gamma, Helm, Johnson & Vlissides',
    description:
      'The original pattern catalog — still the clearest taxonomy of reusable object-oriented solutions.',
    url: 'https://www.goodreads.com/book/show/85009.Design_Patterns',
  },
];

const HOW_IT_WORKS = [
  'Each day, three questions on the same software craft concept — drawn from real code situations, not textbook definitions.',
  'Questions escalate in difficulty. One guess per question, no retries. The commitment is the point.',
  'After all three, the concept is revealed with a definition, a rule of thumb, and a book citation to go deeper.',
];

export default function AboutPage() {
  const dayNumber = getDayNumber(new Date());

  return (
    <div className="flex flex-col min-h-screen">
      <Header dayNumber={dayNumber} streak={0} />

      <main className="flex-1 px-4 max-w-[640px] mx-auto w-full pb-12">

        {/* Identity */}
        <div className="mb-8 pt-2">
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            about
          </p>
          <h1
            className="text-4xl leading-tight mb-3"
            style={{
              fontFamily: 'var(--font-instrument-serif)',
              color: 'var(--accent-brand)',
              fontStyle: 'italic',
            }}
          >
            {SITE_NAME}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            A daily puzzle game for developers. Three questions, all on the same concept —
            a code smell, design pattern, or principle. One guess each. No hints.
            The concept is revealed only after you finish.
          </p>
        </div>

        {/* How it works */}
        <div
          className="rounded-sm p-6 mb-4"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
            How it works
          </p>

          <div className="space-y-5">
            {HOW_IT_WORKS.map((text, i) => (
              <div key={i} className="flex gap-4">
                <span
                  className="text-xs tabular-nums pt-0.5 shrink-0"
                  style={{ color: 'var(--accent-brand)' }}
                >
                  0{i + 1}
                </span>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Reading list */}
        <div
          className="rounded-sm p-6 mb-4"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
            The reading list
          </p>

          {BOOKS.map((book, i) => (
            <div key={book.title}>
              {i > 0 && (
                <div
                  className="h-px my-4"
                  style={{ backgroundColor: 'var(--border-subtle)' }}
                />
              )}
              <a
                href={book.url}
                target="_blank"
                rel="noopener noreferrer"
                className="about-book-link block"
              >
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="about-book-title text-sm">
                    {book.title}
                  </span>
                  <span
                    className="text-xs shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {book.author}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {book.description}
                </p>
              </a>
            </div>
          ))}
        </div>

        {/* GitHub */}
        <a
          href="https://github.com/kkhuu131/devdaily"
          target="_blank"
          rel="noopener noreferrer"
          className="about-ext-link w-full py-2.5 rounded-sm text-sm text-center mb-6"
        >
          View on GitHub →
        </a>

        {/* Back to today's puzzle */}
        <div className="text-center">
          <a href="/" className="about-back-link text-xs">
            ← today&apos;s puzzle
          </a>
        </div>

      </main>

      <Footer />
    </div>
  );
}

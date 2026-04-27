import Link from 'next/link';
import { SITE_NAME, getSiteHostnameForDisplay } from '@/lib/site';

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c.998.005 2.003.138 2.943.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.769.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function Footer() {
  const host = getSiteHostnameForDisplay();

  return (
    <footer className="mt-auto py-7 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 max-w-[760px] mx-auto w-full">
        <nav className="flex items-center gap-5">
          <Link href="/about" className="footer-nav-link text-xs py-1">
            About
          </Link>
          <Link href="/archive" className="footer-nav-link text-xs py-1">
            Archive
          </Link>
          <a
            href="https://github.com/kkhuu131/devdaily"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-nav-link flex items-center gap-1.5 py-1"
            aria-label="devdaily on GitHub"
          >
            <GitHubIcon />
            <span className="text-xs">GitHub</span>
          </a>
        </nav>
        <span className="text-xs sm:text-right" style={{ color: 'var(--text-muted)' }}>
          {host ?? SITE_NAME}
        </span>
      </div>
    </footer>
  );
}

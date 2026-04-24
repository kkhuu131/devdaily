import { SITE_NAME, getSiteHostnameForDisplay } from '@/lib/site';

export default function Footer() {
  const host = getSiteHostnameForDisplay();

  return (
    <footer className="mt-auto py-7 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 max-w-[760px] mx-auto w-full">
        <nav className="flex items-center gap-5">
          <a href="/about" className="footer-nav-link text-xs py-1">
            About
          </a>
          <a href="/archive" className="footer-nav-link text-xs py-1">
            Archive
          </a>
        </nav>
        <span className="text-xs sm:text-right" style={{ color: 'var(--text-muted)' }}>
          {host ?? SITE_NAME}
        </span>
      </div>
    </footer>
  );
}

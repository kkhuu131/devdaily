export default function Footer() {
  return (
    <footer className="mt-auto py-8">
      <div className="flex items-center justify-between px-4 max-w-[640px] mx-auto w-full">
        <nav className="flex items-center gap-4">
          <a href="/about" className="footer-nav-link text-xs">
            About
          </a>
          <a href="/archive" className="footer-nav-link text-xs">
            Archive
          </a>
        </nav>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          devdaily.dev
        </span>
      </div>
    </footer>
  );
}

interface Props {
  highlightedHtml: string;
  language?: string;
}

export default function CodeSnippet({ highlightedHtml, language }: Props) {
  return (
    <div
      className="relative rounded-sm overflow-hidden mt-4"
      style={{
        borderLeft: '2px solid var(--accent-brand)',
        backgroundColor: 'var(--bg-code)',
      }}
    >
      <div
        className={`code-scroll px-4 pb-4 overflow-x-auto ${language ? 'pt-8' : 'pt-4'}`}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
      {/* Fade gradient — sits above the scrollable code, below the language badge */}
      <div
        className="absolute inset-y-0 right-0 pointer-events-none"
        style={{
          width: '3rem',
          background: 'linear-gradient(to right, transparent, var(--bg-code))',
        }}
      />
      {language && (
        <span
          className="absolute top-2 right-3 text-xs select-none"
          style={{ color: 'var(--text-muted)' }}
        >
          {language}
        </span>
      )}
    </div>
  );
}

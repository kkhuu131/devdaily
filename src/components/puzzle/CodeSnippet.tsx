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
      {language && (
        <span
          className="absolute top-2 right-3 text-xs select-none"
          style={{ color: 'var(--text-muted)' }}
        >
          {language}
        </span>
      )}
      <div
        className="p-4 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}

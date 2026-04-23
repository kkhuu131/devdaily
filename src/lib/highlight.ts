import { createHighlighter, type Highlighter } from 'shiki';

// Server-only — do not import from Client Components.

const SUPPORTED_LANGS = ['typescript', 'javascript', 'python', 'java', 'go', 'rust'] as const;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['tokyo-night'],
      langs: [...SUPPORTED_LANGS],
    });
  }
  return highlighterPromise;
}

export async function highlightCode(code: string, lang: string): Promise<string> {
  const safeLang = SUPPORTED_LANGS.includes(lang as typeof SUPPORTED_LANGS[number])
    ? lang
    : 'typescript';
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, { lang: safeLang, theme: 'tokyo-night' });
}

import type { Metadata } from 'next';
import { JetBrains_Mono, Instrument_Serif } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-instrument-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DevDaily — Daily Software Craft Puzzles',
  description:
    'A daily puzzle game for developers. Recognize code smells, design patterns, and SOLID principles through real scenarios.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${instrumentSerif.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {/* Next 16 + React 19: back/forward can restore HTML while the client stays non-interactive.
            Reload on BFCache (`persisted`) or history navigation (`navigation.type === 'back_forward'`). */}
        <Script
          id="dd-bfcache-reload"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  function isPuzzleRoute() {
    var p = location.pathname;
    return p === "/" || /^\\/archive\\/\\d+$/.test(p);
  }
  addEventListener("pageshow", function (e) {
    if (!isPuzzleRoute()) return;
    var navEntry = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    var navType = navEntry && navEntry.type ? navEntry.type : "";
    if (e.persisted || navType === "back_forward") {
      // One frame of restored HTML can show before reload; cover with app base color
      // (--bg-base) so the transition reads as a short load, not a glitchy UI flash.
      var bg = "#0e0d0b";
      document.documentElement.style.backgroundColor = bg;
      var ov = document.createElement("div");
      ov.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:" + bg + ";pointer-events:auto";
      (document.body || document.documentElement).appendChild(ov);
      void ov.offsetHeight;
      location.reload();
    }
  });
})();
`,
          }}
        />
        {children}
      </body>
    </html>
  );
}

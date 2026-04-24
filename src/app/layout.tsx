import type { Metadata } from 'next';
import { JetBrains_Mono, Instrument_Serif } from 'next/font/google';
import Script from 'next/script';
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  getSiteUrl,
} from '@/lib/site';
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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS.split(',').map((k) => k.trim()),
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  robots: { index: true, follow: true },
  verification: {
    google: 'zE60Zc4TmoH1H_nY-kGE1DB-Tvn41MxB0TeuwE50oRU',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: siteUrl,
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web browser',
  inLanguage: 'en',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
} as const;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${instrumentSerif.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
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

import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { SITE_NAME, SITE_TAGLINE, CANONICAL_SITE_URL } from '@/lib/site';

export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const fontsDir = path.join(process.cwd(), 'public', 'fonts');
  const [regular, bold] = await Promise.all([
    readFile(path.join(fontsDir, 'JetBrainsMono-Regular.ttf')),
    readFile(path.join(fontsDir, 'JetBrainsMono-Bold.ttf')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0e0d0b',
          fontFamily: '"JetBrains Mono", monospace',
        }}
      >
        {/* Left: branding */}
        <div
          style={{
            flex: '0 0 56%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '64px 48px 64px 72px',
          }}
        >
          {/* Wordmark + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <span
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: '#e4e0d4',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {SITE_NAME}
            </span>
            <span
              style={{
                background: '#2e2510',
                color: '#d4a843',
                border: '1.5px solid #d4a843',
                fontSize: 13,
                padding: '4px 10px',
                borderRadius: 6,
                letterSpacing: '0.1em',
                fontWeight: 700,
                alignSelf: 'flex-end',
                marginBottom: 10,
              }}
            >
              DAILY
            </span>
          </div>

          {/* Tagline */}
          <div style={{ fontSize: 30, color: '#d4a843', marginBottom: 20, lineHeight: 1 }}>
            {SITE_TAGLINE}
          </div>

          {/* Description */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 20,
              color: '#8c877a',
              lineHeight: 1.55,
              marginBottom: 40,
              maxWidth: 520,
            }}
          >
            <span>Three questions. One concept. Shareable score.</span>
            <span>Same puzzle for every developer each UTC day.</span>
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 10 }}>
            {['code-smell', 'SOLID', 'design-pattern', 'principle'].map((label) => (
              <span
                key={label}
                style={{
                  background: '#181714',
                  border: '1px solid #3a3730',
                  color: '#a39e90',
                  fontSize: 13,
                  padding: '5px 13px',
                  borderRadius: 6,
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: simulated question card */}
        <div
          style={{
            flex: '0 0 44%',
            display: 'flex',
            alignItems: 'center',
            padding: '52px 72px 52px 16px',
          }}
        >
          <div
            style={{
              width: '100%',
              background: '#181714',
              border: '1px solid #3a3730',
              borderRadius: 14,
              padding: '28px 26px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Card header */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}
            >
              <span
                style={{
                  background: '#2e2510',
                  color: '#d4a843',
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 4,
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                }}
              >
                CODE SMELL
              </span>
              <span style={{ color: '#8c877a', fontSize: 12 }}>Question 1 of 3</span>
            </div>

            {/* Question */}
            <div
              style={{
                color: '#e4e0d4',
                fontSize: 15,
                fontWeight: 600,
                lineHeight: 1.45,
                marginBottom: 18,
              }}
            >
              What makes this method suspicious?
            </div>

            {/* Answer options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                'Extract it into a utility class elsewhere',
                'Return type should be void instead',
                "It envies another class's internal data",
                'Missing null check on the parameter',
              ].map((text, i) => (
                <div
                  key={i}
                  style={{
                    background: '#0e0d0b',
                    border: '1px solid #3a3730',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: '#a39e90',
                    fontSize: 13,
                    lineHeight: 1.3,
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <span style={{ color: '#3a3730', flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* URL footer */}
            <div
              style={{
                marginTop: 18,
                color: '#3a3730',
                fontSize: 12,
                textAlign: 'right',
              }}
            >
              {CANONICAL_SITE_URL.replace('https://', '')}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'JetBrains Mono', data: regular, style: 'normal', weight: 400 },
        { name: 'JetBrains Mono', data: bold, style: 'normal', weight: 700 },
      ],
    },
  );
}

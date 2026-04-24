import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site';

export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: '#0e0d0b',
          color: '#e4e0d4',
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 32, color: '#d4a843', marginTop: 16 }}>{SITE_TAGLINE}</div>
        <div
          style={{
            fontSize: 22,
            color: '#8c877a',
            marginTop: 32,
            maxWidth: 900,
            lineHeight: 1.45,
          }}
        >
          Code smells, design patterns, and SOLID—three questions, one concept per UTC day.
        </div>
      </div>
    ),
    { ...size },
  );
}

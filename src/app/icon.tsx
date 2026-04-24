import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

function brandInitials(name: string): string {
  const parts = name.split(/(?=[A-Z])|[\s_-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  const letters = name.replace(/[^a-zA-Z0-9]/g, '');
  return letters.slice(0, 2).toUpperCase() || '?';
}

export default function Icon() {
  const initials = brandInitials(SITE_NAME);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0e0d0b',
          color: '#d4a843',
          fontSize: 18,
          fontWeight: 700,
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        }}
      >
        {initials}
      </div>
    ),
    { ...size },
  );
}

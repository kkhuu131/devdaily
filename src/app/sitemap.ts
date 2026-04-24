import type { MetadataRoute } from 'next';
import { getDayNumber } from '@/lib/puzzle';
import { getSiteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();
  const todayDay = getDayNumber(now);

  const entries: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/archive`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  for (let day = 1; day < todayDay; day++) {
    entries.push({
      url: `${base}/archive/${day}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    });
  }

  return entries;
}

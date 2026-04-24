'use client';

import { useEffect } from 'react';

function isPuzzleRoute(pathname: string): boolean {
  return pathname === '/' || /^\/archive\/\d+$/.test(pathname);
}

export default function BfCacheReload() {
  useEffect(() => {
    function onPageShow(event: PageTransitionEvent) {
      if (!isPuzzleRoute(window.location.pathname)) return;

      const navEntry = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined;
      const navType = navEntry?.type ?? '';

      if (event.persisted || navType === 'back_forward') {
        // Cover possible one-frame stale UI before forcing a clean reload.
        const bg = '#0e0d0b';
        document.documentElement.style.backgroundColor = bg;

        const overlay = document.createElement('div');
        overlay.style.cssText =
          `position:fixed;inset:0;z-index:2147483647;background:${bg};pointer-events:auto`;
        (document.body || document.documentElement).appendChild(overlay);

        // Force style flush so overlay paints before reload.
        void overlay.offsetHeight;
        window.location.reload();
      }
    }

    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  return null;
}

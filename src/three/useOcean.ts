import { useEffect, type RefObject } from 'react';

type Options = { particles?: number; waveOpacity?: number };

/**
 * Adds the Three.js ocean to an element, without slowing the first paint: three.js is downloaded only
 * once the browser is idle, and not at all for visitors on "save data" or who prefer reduced data.
 */
export function useOcean(host: RefObject<HTMLElement>, opts: Options = {}) {
  const { particles, waveOpacity } = opts;
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData || window.matchMedia('(prefers-reduced-data: reduce)').matches) return;

    let dispose: (() => void) | undefined;
    let cancelled = false;
    const start = () => {
      import('./OceanScene').then(({ createOceanScene }) => {
        if (cancelled || !host.current) return;
        dispose = createOceanScene(host.current, { particles, waveOpacity });
        host.current.classList.add('is-ready');
      });
    };
    // Safari has no requestIdleCallback: fall back to a short timeout
    const hasIdle = typeof window.requestIdleCallback === 'function';
    const id = hasIdle ? window.requestIdleCallback(start, { timeout: 2500 }) : window.setTimeout(start, 1200);

    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
      dispose?.();
    };
  }, [host, particles, waveOpacity]);
}

import { useLayoutEffect } from 'react';
import { gsap, prefersReducedMotion, ScrollTrigger } from '../lib/gsap';

/** Where each reveal class starts from */
const presets: Record<string, gsap.TweenVars> = {
  'sr-up': { y: 60 },
  'sr-left': { x: -80 },
  'sr-right': { x: 80 },
  'sr-zoom': { scale: 0.85 },
  'sr-fade': {},
};

/**
 * Fade/slide-in reveals for the utility classes used across the site (.sr-up, .sr-left, .sr-right,
 * .sr-zoom, .sr-fade). Driven by ScrollTrigger rather than a separate library, so trigger points are
 * re-measured whenever the page's layout changes (the pinned dive, pinned sections, fonts loading).
 * Elements are only hidden once JS is ready, and only the ones on the page at that point.
 */
export function useScrollReveal() {
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      Object.entries(presets).forEach(([cls, from]) => {
        // Accommodation cards have their own flip-in animation
        const els = gsap.utils.toArray<HTMLElement>(`.${cls}:not(.unit)`);
        if (!els.length) return;
        gsap.set(els, { autoAlpha: 0, ...from });
        const show = (batch: Element[]) =>
          gsap.to(batch, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1.1, ease: 'tide', stagger: 0.09, overwrite: true });
        // onLeave too, so anything jumped straight past (anchor links, fast flicks) still shows
        ScrollTrigger.batch(els, { start: 'top 90%', once: true, onEnter: show, onLeave: show });
      });
    });
    return () => ctx.revert();
  }, []);
}

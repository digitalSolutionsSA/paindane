import { useEffect } from 'react';
import ScrollReveal from 'scrollreveal';

/** Wires ScrollReveal to the utility classes used across the site. */
export function useScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const sr = ScrollReveal({
      distance: '60px',
      duration: 1100,
      easing: 'cubic-bezier(.2,.65,.25,1)',
      reset: false,
      viewFactor: 0.15,
    });
    sr.reveal('.sr-up', { origin: 'bottom', interval: 90 });
    sr.reveal('.sr-left', { origin: 'left' });
    sr.reveal('.sr-right', { origin: 'right' });
    sr.reveal('.sr-zoom', { scale: 0.85, distance: '0px', interval: 60 });
    sr.reveal('.sr-fade', { distance: '0px', duration: 1600 });
    return () => sr.destroy();
  }, []);
}

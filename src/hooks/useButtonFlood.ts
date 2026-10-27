import { useEffect } from 'react';
import { canHover, prefersReducedMotion } from '../lib/gsap';

/**
 * Buttons fill with colour from exactly where the pointer comes in, and drain back towards where it
 * leaves. One listener for the whole page sets the entry point (--fx/--fy) for the CSS in motion.css.
 */
export function useButtonFlood() {
  useEffect(() => {
    if (!canHover() || prefersReducedMotion()) return;
    const place = (btn: HTMLElement, e: PointerEvent) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--fx', `${e.clientX - r.left}px`);
      btn.style.setProperty('--fy', `${e.clientY - r.top}px`);
    };
    const over = (e: PointerEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('.btn');
      if (!btn || btn.contains(e.relatedTarget as Node)) return;
      place(btn, e);
      btn.classList.add('is-flood');
    };
    const out = (e: PointerEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('.btn');
      if (!btn || btn.contains(e.relatedTarget as Node)) return;
      place(btn, e);
      btn.classList.remove('is-flood');
    };
    document.documentElement.classList.add('has-flood');
    document.addEventListener('pointerover', over);
    document.addEventListener('pointerout', out);
    return () => {
      document.documentElement.classList.remove('has-flood');
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointerout', out);
    };
  }, []);
}

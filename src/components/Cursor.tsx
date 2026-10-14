import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label';
const VIEWABLE = '.gallery-item, .feature-media, .strip-item';
const MAGNETIC = '.btn, .nav-cta, .whatsapp-float, .socials a, .hero-dots button';

/**
 * Desktop only: a soft ring that trails the pointer, grows over links and shows "View" over photos;
 * buttons lean towards the pointer ("magnetic").
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || calm || !ring.current || !dot.current) return;

    document.documentElement.classList.add('has-cursor');
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3.out' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3.out' });
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08 });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08 });
    let mode = '';

    const setMode = (m: string) => {
      if (m === mode || !ring.current) return;
      mode = m;
      ring.current.dataset.mode = m;
      if (label.current) label.current.textContent = m === 'view' ? 'View' : '';
    };

    const onMove = (e: PointerEvent) => {
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
      const t = e.target as HTMLElement;
      setMode(t.closest(VIEWABLE) ? 'view' : t.closest(INTERACTIVE) ? 'link' : '');
    };
    const onLeave = () => gsap.to([ring.current, dot.current], { autoAlpha: 0, duration: 0.3 });
    const onEnter = () => gsap.to([ring.current, dot.current], { autoAlpha: 1, duration: 0.3 });
    const onDown = () => gsap.to(ring.current, { scale: 0.8, duration: 0.15 });
    const onUp = () => gsap.to(ring.current, { scale: 1, duration: 0.3, ease: 'back.out(3)' });

    // Magnetic buttons
    const magnets = new Map<HTMLElement, { x: gsap.QuickToFunc; y: gsap.QuickToFunc }>();
    const magnetFor = (el: HTMLElement) => {
      let m = magnets.get(el);
      if (!m) {
        m = { x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' }), y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' }) };
        magnets.set(el, m);
      }
      return m;
    };
    let current: HTMLElement | null = null;
    const onMagnet = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(MAGNETIC);
      if (current && current !== el) {
        const m = magnetFor(current);
        m.x(0);
        m.y(0);
      }
      current = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const m = magnetFor(el);
      m.x((e.clientX - (r.left + r.width / 2)) * 0.3);
      m.y((e.clientY - (r.top + r.height / 2)) * 0.4);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointermove', onMagnet);
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointermove', onMagnet);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      magnets.forEach((_, el) => gsap.set(el, { x: 0, y: 0 }));
    };
  }, []);

  return (
    <>
      <div className="cursor-ring" ref={ring} aria-hidden="true">
        <span ref={label} />
      </div>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
    </>
  );
}

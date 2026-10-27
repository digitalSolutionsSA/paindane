import { useLayoutEffect, useRef } from 'react';
import { contact, contactSection } from '../content';
import { canHover, gsap, prefersReducedMotion, SplitText } from '../lib/gsap';
import { WaveDivider } from './Decor';
import { WhatsApp } from './Icons';

/**
 * Pinned "sunrise": a small sun on a dusky sea grows until it fills the screen as you scroll, a ring
 * ripples out from it, and the headline's letters tumble into place – then lean away from the pointer.
 */
export default function SunPortal() {
  const root = useRef<HTMLDivElement>(null);
  const { portal } = contactSection;

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let cleanupPointer = () => {};
    const ctx = gsap.context(() => {
      const split = SplitText.create('[data-portal-title]', { type: 'words,chars' });
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: el, start: 'top top', end: '+=140%', scrub: 1, pin: true, anticipatePin: 1 },
        })
        .fromTo('[data-portal]', { clipPath: 'circle(3% at 50% 58%)' }, { clipPath: 'circle(80% at 50% 58%)', duration: 1 }, 0)
        .fromTo('[data-portal-ring]', { scale: 0.05, opacity: 1 }, { scale: 2.4, opacity: 0, duration: 0.9 }, 0)
        .to('[data-portal-tease]', { opacity: 0, scale: 0.85, duration: 0.25 }, 0.1)
        .from(split.chars, { yPercent: -140, rotate: () => gsap.utils.random(-40, 40), opacity: 0, stagger: 0.015, duration: 0.35, ease: 'back.out(2)' }, 0.5)
        .from('[data-portal-fade]', { y: 40, opacity: 0, stagger: 0.06, duration: 0.25 }, 0.75);

      if (canHover()) {
        const chars = split.chars as HTMLElement[];
        const move = (e: PointerEvent) => {
          chars.forEach((c) => {
            const r = c.getBoundingClientRect();
            const dx = r.left + r.width / 2 - e.clientX;
            const dy = r.top + r.height / 2 - e.clientY;
            const dist = Math.hypot(dx, dy);
            const push = Math.max(0, 1 - dist / 220);
            gsap.to(c, { x: (dx / (dist || 1)) * push * 26, y: (dy / (dist || 1)) * push * 26, duration: 0.5, ease: 'power3', overwrite: 'auto' });
          });
        };
        const leave = () => gsap.to(chars, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        cleanupPointer = () => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerleave', leave);
        };
      }
    }, root);
    return () => {
      cleanupPointer();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={root} className="portal">
      <div className="portal-tease" data-portal-tease>
        <p>{portal.tease}</p>
      </div>
      <div className="portal-ring" data-portal-ring aria-hidden="true" />

      <div className="portal-sun" data-portal>
        <div className="portal-rays" aria-hidden="true" />
        <p className="portal-kicker" data-portal-fade>
          {portal.kicker}
        </p>
        <h2 className="portal-title" data-portal-title>
          {portal.title[0]}
          <br />
          {portal.title[1]}
        </h2>
        <p className="portal-text" data-portal-fade>
          {portal.text}
        </p>
        <div className="portal-actions" data-portal-fade>
          <a className="btn btn-dark" href={contact.whatsapp} target="_blank" rel="noreferrer">
            <WhatsApp width={18} height={18} />
            &nbsp; WhatsApp us
          </a>
          <a className="btn btn-outline-dark" href="#accommodation">
            View accommodation
          </a>
        </div>
        <WaveDivider color="var(--cream)" tide={false} />
      </div>
    </div>
  );
}

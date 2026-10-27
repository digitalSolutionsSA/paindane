import { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion, ScrollTrigger } from '../lib/gsap';

const WORDS = ['Paindane', 'Pleasure Bay', 'Lighthouse Reef', 'Sea Safaris', 'Scuba Diving', 'Deep-sea Fishing'];

/**
 * Two giant bands of type that slide in opposite directions with the scroll, and lean into it – the
 * faster you scroll, the harder they skew.
 */
export default function VelocityBand() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const scrub = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.5 };
      gsap.fromTo('[data-band="a"]', { xPercent: 0 }, { xPercent: -30, ease: 'none', scrollTrigger: scrub });
      gsap.fromTo('[data-band="b"]', { xPercent: -30 }, { xPercent: 0, ease: 'none', scrollTrigger: scrub });
      const skewTo = gsap.quickTo('[data-band]', 'skewX', { duration: 0.6, ease: 'power3' });
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => skewTo(gsap.utils.clamp(-14, 14, self.getVelocity() / -260)),
        onLeave: () => skewTo(0),
        onLeaveBack: () => skewTo(0),
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const row = (filled: boolean) =>
    [...WORDS, ...WORDS].map((w, i) => (
      <span key={i} className="vband-item">
        <span className={filled ? 'vband-fill' : 'vband-stroke'}>{w}</span>
        <span className={`vband-star ${i % 2 ? 'is-ocean' : ''}`}>✦</span>
      </span>
    ));

  return (
    <div ref={root} className="vband" aria-hidden="true">
      <div className="vband-row" data-band="a">
        {row(false)}
      </div>
      <div className="vband-row" data-band="b">
        {row(true)}
      </div>
    </div>
  );
}

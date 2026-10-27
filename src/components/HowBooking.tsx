import { useLayoutEffect, useRef } from 'react';
import { howBooking } from '../content';
import { gsap, prefersReducedMotion, ScrollTrigger } from '../lib/gsap';

// A loose wave that runs behind every step
const WAVE = 'M0,120 C150,20 250,220 400,120 S650,20 800,120 S1050,220 1200,120 S1450,20 1600,120 S1850,220 2000,120';

/**
 * How booking works. Desktop pins the section and scrolling drives the steps sideways while a wave line
 * draws itself through them; each step's outlined number floods with sunset colour as it reaches the
 * middle. Phones get a vertical list with a line down the side that fills as you scroll.
 */
export default function HowBooking() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.matchMedia().add('(min-width: 1024px)', () => {
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance() + window.innerHeight * 0.4}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(el, { x: () => -distance() }, 0).fromTo('[data-how-wave]', { drawSVG: '0%' }, { drawSVG: '100%' }, 0);

        gsap.utils.toArray<HTMLElement>('[data-step]').forEach((step) => {
          const st = { trigger: step, containerAnimation: tl, start: 'left 75%', end: 'center center', scrub: true };
          gsap.fromTo(step.querySelector('[data-step-fill]'), { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', ease: 'none', scrollTrigger: st });
          gsap.from(step.querySelectorAll('[data-step-in]'), { y: 60, opacity: 0, stagger: 0.1, ease: 'none', scrollTrigger: st });
          gsap.fromTo(step.querySelector('[data-step-node]'), { scale: 0 }, { scale: 1, ease: 'back.out(3)', scrollTrigger: st });
        });
      });

      gsap.matchMedia().add('(max-width: 1023px)', () => {
        const steps = gsap.utils.toArray<HTMLElement>('[data-step]');
        const rail = el.querySelector<HTMLElement>('[data-rail]');
        if (!rail || !steps.length) return;
        const first = steps[0];
        const last = steps[steps.length - 1];
        const place = () => {
          rail.style.top = `${first.offsetTop}px`;
          rail.style.height = `${last.offsetTop + last.offsetHeight - first.offsetTop}px`;
        };
        place();
        ScrollTrigger.addEventListener('refreshInit', place);
        const st = { trigger: first, endTrigger: last, start: 'top 70%', end: 'bottom 70%', scrub: 0.5 };
        gsap.fromTo('[data-rail-fill]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: st });
        gsap.fromTo('[data-rail-tip]', { top: '0%' }, { top: '100%', ease: 'none', scrollTrigger: st });
        steps.forEach((s) =>
          gsap.from(s, { y: 50, opacity: 0, duration: 1, ease: 'tide', scrollTrigger: { trigger: s, start: 'top 85%' } }),
        );
        return () => ScrollTrigger.removeEventListener('refreshInit', place);
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="how">
      <div ref={track} className="how-track">
        <div data-rail className="how-rail" aria-hidden="true">
          <div data-rail-fill className="how-rail-fill" />
          <span data-rail-tip className="how-rail-tip" />
        </div>

        <svg className="how-wave" viewBox="0 0 2000 240" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="how-wave-grad" x1="0" x2="1">
              <stop offset="0" stopColor="#ffc21a" />
              <stop offset="0.5" stopColor="#ff8a1f" />
              <stop offset="1" stopColor="#19a8e0" />
            </linearGradient>
          </defs>
          <path d={WAVE} fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <path data-how-wave d={WAVE} fill="none" stroke="url(#how-wave-grad)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </svg>

        <div className="how-intro">
          <span className="eyebrow">{howBooking.eyebrow}</span>
          <h2 className="how-title" data-split>
            {howBooking.title[0]}
            <br />
            <span>{howBooking.title[1]}</span>
          </h2>
          <p className="how-lead">{howBooking.intro}</p>
          <p className="how-more">
            Keep scrolling <i />
          </p>
        </div>

        {howBooking.steps.map((s) => (
          <div key={s.n} className="how-step" data-step>
            <span className="how-node" data-step-node aria-hidden="true" />
            <div className="how-num">
              <span className="how-num-outline">{s.n}</span>
              <span className="how-num-fill" data-step-fill aria-hidden="true">
                {s.n}
              </span>
            </div>
            <div className="how-body">
              <h3 data-step-in>{s.title}</h3>
              <p data-step-in>{s.text}</p>
              <div className="how-tags" data-step-in>
                {s.tags.map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div className="how-end" aria-hidden="true" />
      </div>
    </div>
  );
}

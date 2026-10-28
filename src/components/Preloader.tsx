import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { Logo } from './Picture';

/** Curtain intro: logo fades in, then two panels slide away. */
export default function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .from('.pl-logo', { autoAlpha: 0, y: 20, duration: 0.5, ease: 'power3.out' })
        .to('.pl-bar span', { scaleX: 1, duration: 0.55, ease: 'power2.inOut' }, '<0.05')
        .to('.pl-inner', { autoAlpha: 0, y: -20, duration: 0.3 })
        .to('.pl-panel--top', { yPercent: -100, duration: 0.85, ease: 'expo.inOut' }, '<0.05')
        .to('.pl-panel--bottom', { yPercent: 100, duration: 0.85, ease: 'expo.inOut' }, '<')
        .set(ref.current, { display: 'none' });
    }, ref);
    // Safety net: never let the intro block the page (e.g. in a background tab)
    const fallback = window.setTimeout(() => {
      if (ref.current) ref.current.style.display = 'none';
    }, 3000);
    return () => {
      window.clearTimeout(fallback);
      ctx.revert();
    };
  }, []);

  return (
    <div className="preloader" ref={ref} aria-hidden="true">
      <div className="pl-panel pl-panel--top" />
      <div className="pl-panel pl-panel--bottom" />
      <div className="pl-inner">
        <Logo className="pl-logo" sizes="(max-width: 472px) 72vw, 340px" alt="" />
        <div className="pl-bar">
          <span />
        </div>
      </div>
    </div>
  );
}

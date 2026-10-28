import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Stop the browser (and ScrollTrigger) from restoring the old scroll position on reload
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
ScrollTrigger.clearScrollMemory('manual');

let lenis: Lenis | null = null;

/** Height of the fixed header, so anchored sections don't end up underneath it */
const HEADER_OFFSET = -80;

/** Scrolls smoothly to an element or y position (falls back to native scrolling without Lenis). */
export function scrollToTarget(target: string | HTMLElement | number, opts: { immediate?: boolean } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset: typeof target === 'number' ? 0 : HEADER_OFFSET, duration: 1.6, immediate: opts.immediate });
    return;
  }
  if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
  else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView({ behavior: 'smooth' });
}

/** Pauses smooth scrolling (e.g. while a modal is open) */
export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();

/**
 * Buttery smooth scrolling (Lenis) driven by GSAP's ticker, so every ScrollTrigger animation stays in
 * sync with it. In-page links (#section and /#section on the home page) glide instead of jumping.
 * Turned off for visitors who prefer reduced motion.
 */
export function useSmoothScroll() {
  useEffect(() => {
    // Every visit starts at the very top: a new visit, a reload, coming back with Back/Forward, or arriving
    // from an old or shared link with a #section. The one exception is a link from another page of this site
    // (e.g. "Enquire Now" on the Gallery page), which still lands on its section.
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const fromOwnPage = (() => {
      try {
        return nav?.type === 'navigate' && !!document.referrer && new URL(document.referrer).origin === window.location.origin;
      } catch {
        return false;
      }
    })();
    if (window.location.hash && !fromOwnPage) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    if (!window.location.hash) window.scrollTo(0, 0);
    // Pages restored from the browser's back/forward cache keep their old scroll position – reset that too
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      if (lenis) lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
    };
    window.addEventListener('pageshow', onPageShow);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => window.removeEventListener('pageshow', onPageShow);
    }

    const instance = new Lenis({ duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4), wheelMultiplier: 1, touchMultiplier: 1.4 });
    lenis = instance;
    instance.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest('a');
      if (!a) return;
      const href = a.getAttribute('href') ?? '';
      const onThisPage = href.startsWith('#') || (href.startsWith('/#') && window.location.pathname === '/');
      if (!onThisPage) return;
      const id = href.slice(href.indexOf('#'));
      if (id === '#top') {
        e.preventDefault();
        instance.scrollTo(0, { duration: 1.8 });
        return;
      }
      const el = id.length > 1 ? document.querySelector<HTMLElement>(id) : null;
      if (!el) return;
      e.preventDefault();
      // The URL is left as-is, so a reload never jumps back to this section
      instance.scrollTo(el, { offset: HEADER_OFFSET, duration: 1.6 });
    };
    document.addEventListener('click', onClick);

    // Arriving with a #hash (e.g. from the legal pages): land on it once the layout has settled
    if (window.location.hash.length > 1) {
      const el = document.querySelector<HTMLElement>(window.location.hash);
      if (el) window.setTimeout(() => instance.scrollTo(el, { offset: HEADER_OFFSET, immediate: true }), 600);
    }

    return () => {
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(raf);
      instance.destroy();
      lenis = null;
    };
  }, []);
}

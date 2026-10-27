import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { brand, diveLines, heroHeading, heroSlides } from '../content';
import { WaveDivider } from './Decor';
import { Down } from './Icons';
import Picture from './Picture';
import type { OceanDive } from './underwater/oceanDive';
import '../hero.css';

gsap.registerPlugin(ScrollTrigger, SplitText);

const SLIDE_MS = 6500;

/**
 * The hero is a dive: it opens on photos of the resort under a big headline, and scrolling sinks the view
 * through the surface into a live 3D sea (three.js) – shoals of fish that flock and dart away from the
 * pointer, a whale shark, glowing orbs and light running along current lines. GSAP ties the camera's
 * descent to the scroll, and on the way down a streak of light crosses each line of text, revealing it.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const ocean = useRef<OceanDive | null>(null);
  const progress = useRef({ p: 0 });
  const [slide, setSlide] = useState(0);
  // Only the first photo loads up front; the others once the page has finished loading
  const [allSlides, setAllSlides] = useState(false);

  // The 3D sea (and three.js itself) loads after the page, so the first paint stays fast
  useEffect(() => {
    let disposed = false;
    let io: IntersectionObserver | undefined;
    const el = canvas.current;
    const onPointer = (e: PointerEvent) => ocean.current?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    const onResize = () => ocean.current?.resize();
    const load = () =>
      import('./underwater/oceanDive')
        .then(({ createOceanDive }) => {
          if (disposed || !el) return;
          try {
            ocean.current = createOceanDive(el);
          } catch {
            el.classList.add('is-fallback');
            return;
          }
          ocean.current.setProgress(progress.current.p);
          el.classList.add('is-ready');
          io = new IntersectionObserver(([e]) => ocean.current?.setActive(e.isIntersecting));
          if (root.current) io.observe(root.current);
          window.addEventListener('pointermove', onPointer, { passive: true });
          window.addEventListener('resize', onResize);
        })
        .catch(() => el?.classList.add('is-fallback'));
    if (document.readyState === 'complete') load();
    else window.addEventListener('load', load, { once: true });
    return () => {
      disposed = true;
      window.removeEventListener('load', load);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      io?.disconnect();
      ocean.current?.dispose();
      ocean.current = null;
    };
  }, []);

  useEffect(() => {
    const arm = () => setAllSlides(true);
    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm, { once: true });
    const t = window.setTimeout(arm, 4000);
    return () => {
      window.removeEventListener('load', arm);
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!allSlides || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [allSlides]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Headline entrance as the preloader curtain opens: letters rise and settle, line by line
      const split = SplitText.create('.dive-title-line', { type: 'words,chars', mask: 'words' });
      gsap
        .timeline({ delay: 1.5 })
        .from('.dive-eyebrow', { y: 20, autoAlpha: 0, duration: 0.8, ease: 'power3.out' })
        .from(split.chars, { yPercent: 110, rotate: 8, duration: 1.1, ease: 'expo.out', stagger: 0.025 }, '-=0.5')
        .from('.dive-sub', { y: 20, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, '-=0.7')
        .from('.dive-actions .btn', { y: 20, autoAlpha: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, '-=0.6')
        .from('.dive-hint', { autoAlpha: 0, duration: 0.8 }, '-=0.3');

      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        const vw = () => window.innerWidth;
        const lines = gsap.utils.toArray<HTMLElement>('.dive-line');
        lines.forEach((line, i) => {
          const fromRight = i % 2 === 1;
          gsap.set(line.querySelector('.dive-line-text'), { clipPath: fromRight ? 'inset(-30% 0% -30% 100%)' : 'inset(-30% 100% -30% 0%)' });
        });
        gsap.set('.dive-cta > *', { autoAlpha: 0, y: 40 });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true },
        });

        // Push into the photo as it lifts away like a curtain of water, then the camera sinks to the reef
        tl.to('.dive-sky', { yPercent: -125, duration: 2, ease: 'power2.inOut' }, 0)
          .to('.dive-photos', { scale: 1.2, duration: 2 }, 0)
          .to('.dive-sky-content', { yPercent: 40, autoAlpha: 0, duration: 1.4 }, 0)
          .to('.dive-hint', { autoAlpha: 0, duration: 0.4 }, 0)
          .to(progress.current, { p: 1, duration: 10, onUpdate: () => ocean.current?.setProgress(progress.current.p) }, 0);

        // Each line: an orb of light streaks across and the words appear in its wake
        lines.forEach((line, i) => {
          const fromRight = i % 2 === 1;
          const at = 2.4 + i * 2;
          tl.fromTo(
            line.querySelector('.dive-line-orb'),
            { x: () => (fromRight ? vw() * 1.1 : -vw() * 0.1) },
            { x: () => (fromRight ? -vw() * 0.1 : vw() * 1.1), duration: 2 },
            at,
          ).to(line.querySelector('.dive-line-text'), { clipPath: 'inset(-30% 0% -30% 0%)', duration: 1.3 }, at + 0.35);
        });

        tl.to('.dive-cta > *', { autoAlpha: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out' }, 8.6).to({}, { duration: 0.6 });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="top" className="dive" ref={root}>
      <div className="dive-stage">
        <canvas className="dive-gl" ref={canvas} aria-hidden="true" />

        {/* Above the water: the resort itself */}
        <div className="dive-sky">
          <div className="dive-photos" aria-hidden="true">
            {heroSlides.map((src, i) => (
              <div key={src} className={`dive-photo ${i === slide ? 'is-active' : ''}`}>
                {(i === 0 || allSlides) && <Picture src={src} alt="" sizes="100vw" priority={i === 0} />}
              </div>
            ))}
          </div>
          <div className="dive-sky-shade" />
          <div className="dive-sky-content container">
            <p className="dive-eyebrow">{heroHeading.eyebrow}</p>
            <h1 className="dive-title">
              {heroHeading.lines.map((l, i) => (
                <span key={l} className={`dive-title-line dive-title-line--${i}`}>
                  {l}
                </span>
              ))}
            </h1>
            <p className="dive-sub">{heroHeading.sub}</p>
            <div className="dive-actions">
              <a href="#welcome" className="btn btn-light">Explore</a>
              <a href="#contact" className="btn btn-sand">Enquire Now</a>
            </div>
          </div>
          <WaveDivider color="rgba(28, 147, 196, 0.95)" tide={false} />
        </div>

        {/* Words revealed by a passing streak of light */}
        <div className="dive-lines">
          {diveLines.map((text, i) => (
            <div key={text} className={`dive-line dive-line--${i} ${i % 2 === 1 ? 'dive-line--rtl' : ''}`}>
              <p className="dive-line-text">{text}</p>
              <span className="dive-line-orb" aria-hidden="true" />
            </div>
          ))}
          <div className="dive-cta">
            <a href="#welcome" className="btn btn-light">Explore the resorts</a>
            <a href="#contact" className="btn btn-sand">Enquire now</a>
          </div>
        </div>

        <a href="#welcome" className="dive-hint" aria-label={`Welcome to ${brand.name}`}>
          <span>Scroll to dive in</span>
          <Down width={22} height={22} />
        </a>
      </div>
      <WaveDivider color="var(--cream)" tide={false} />
    </section>
  );
}

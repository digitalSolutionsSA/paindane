import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { brand, heroSlides } from '../content';
import { useOcean } from '../three/useOcean';
import { Down } from './Icons';
import Picture, { logoUrl } from './Picture';

gsap.registerPlugin(ScrollTrigger);

const SLIDE_MS = 6500;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  // Only the first photo loads up front; the others once the page has finished loading
  const [allSlides, setAllSlides] = useState(false);

  useOcean(canvasHost);

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

  // Slideshow timer
  useEffect(() => {
    if (!allSlides) return;
    const id = window.setInterval(() => setCurrent((c) => (c + 1) % heroSlides.length), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [current, allSlides]);

  // Crossfade + Ken Burns on the active slide
  useLayoutEffect(() => {
    const slides = root.current?.querySelectorAll<HTMLElement>('.hero-slide');
    if (!slides) return;
    slides.forEach((s, i) => {
      if (i === current) {
        gsap.to(s, { autoAlpha: 1, duration: 1.6, ease: 'power2.inOut' });
        gsap.fromTo(s.firstElementChild, { scale: 1.18, xPercent: i % 2 ? 2 : -2 }, { scale: 1.02, xPercent: 0, duration: SLIDE_MS / 1000 + 1.6, ease: 'none' });
      } else {
        gsap.to(s, { autoAlpha: 0, duration: 1.6, ease: 'power2.inOut' });
      }
    });
  }, [current, allSlides]);

  // Intro timeline + scroll-out
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.4 });
      tl.from('.hero-logo', { y: 40, autoAlpha: 0, scale: 0.9, duration: 1.4, ease: 'expo.out' })
        .from('.hero-tagline span', { yPercent: 120, duration: 1, stagger: 0.08, ease: 'expo.out' }, '-=0.9')
        .from('.hero-line', { scaleX: 0, duration: 1.2, ease: 'expo.inOut' }, '-=0.8')
        .from('.hero-actions > *', { y: 20, autoAlpha: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, '-=0.6')
        .from('.hero-scroll', { autoAlpha: 0, duration: 0.8 }, '-=0.3');

      gsap.to('.hero-content', {
        yPercent: 35,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero-slides', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      // The hero folds into a rounded card as the page takes over
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          root.current,
          { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)' },
          {
            clipPath: 'inset(0% 3% 8% 3% round 0px 0px 56px 56px)',
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
          },
        );
        gsap.to('.hero-ocean', {
          yPercent: -25,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="top" className="hero" ref={root}>
      <div className="hero-slides" aria-hidden="true">
        {heroSlides.map((src, i) => (
          <div className="hero-slide" key={src} style={{ opacity: i === 0 ? 1 : 0 }}>
            <div className="hero-img">{(i === 0 || allSlides) && <Picture src={src} alt="" sizes="100vw" priority={i === 0} />}</div>
          </div>
        ))}
      </div>
      <div className="hero-shade" />
      <div className="hero-ocean" ref={canvasHost} aria-hidden="true" />

      <div className="hero-content container">
        <img className="hero-logo" src={logoUrl()} alt={brand.name} width={691} height={304} {...({ fetchpriority: 'high' } as Record<string, string>)} />
        <div className="hero-line" />
        <p className="hero-tagline">
          {brand.tagline.split(' ').map((w, i) => (
            <span className="mask" key={i}>
              <span>{w}&nbsp;</span>
            </span>
          ))}
        </p>
        <div className="hero-actions">
          <a href="#welcome" className="btn btn-light">Welcome</a>
          <a href="#contact" className="btn btn-sand">Book Now</a>
        </div>
      </div>

      <div className="hero-dots">
        {heroSlides.map((_, i) => (
          <button key={i} className={i === current ? 'active' : ''} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>

      <a href="#welcome" className="hero-scroll" aria-label={`Welcome to ${brand.name}`}>
        <span>Scroll</span>
        <Down width={22} height={22} />
      </a>
    </section>
  );
}

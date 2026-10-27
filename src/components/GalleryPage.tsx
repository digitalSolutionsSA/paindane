import { useLayoutEffect, useRef } from 'react';
import { gallery, galleryPage } from '../content';
import { gsap } from '../lib/gsap';
import { useOcean } from '../three/useOcean';
import Gallery from './Gallery';
import Picture from './Picture';

/** The full photo gallery on its own page: a photo hero, then every photo in a masonry grid. */
export default function GalleryPage({ onOpen }: { onOpen: (index: number) => void }) {
  const oceanHost = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useOcean(oceanHost, { particles: 500, waveOpacity: 0.45 });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.legal-hero-title', { y: 40, autoAlpha: 0, duration: 1.2, ease: 'expo.out', delay: 0.2 });
      gsap.from('.legal-hero .eyebrow, .gallery-hero-sub', { autoAlpha: 0, duration: 1, delay: 0.5, stagger: 0.1 });
      gsap.to('.legal-hero-bg', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: { trigger: '.legal-hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root}>
      <section id="top" className="legal-hero">
        <div className="legal-hero-bg">
          <Picture src={galleryPage.image} alt="" sizes="100vw" priority />
        </div>
        <div className="hero-shade" />
        <div className="hero-ocean" ref={oceanHost} aria-hidden="true" />
        <div className="container legal-hero-inner">
          <span className="eyebrow">{galleryPage.eyebrow}</span>
          <h1 className="legal-hero-title">{galleryPage.title}</h1>
          <p className="gallery-hero-sub">
            {gallery.length} {galleryPage.sub}
          </p>
        </div>
      </section>

      <section id="gallery" className="section section--dark gallery-page">
        <div className="container">
          <Gallery onOpen={onOpen} />
          <div className="gallery-page-actions sr-up">
            <a href="/" className="btn btn-light">
              Back to Home
            </a>
            <a href="/#enquire" className="btn btn-sand">
              Enquire Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

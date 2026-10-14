import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import type { LegalSection } from '../legal';
import { useOcean } from '../three/useOcean';
import { contact } from '../content';
import Picture from './Picture';

type Props = {
  title: string;
  eyebrow: string;
  image: string;
  sections: LegalSection[];
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Linkify the contact email where it appears in the copy. */
function Paragraph({ text }: { text: string }) {
  const parts = text.split(contact.email);
  return (
    <p>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
        </span>
      ))}
    </p>
  );
}

export default function LegalPage({ title, eyebrow, image, sections }: Props) {
  const oceanHost = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useOcean(oceanHost, { particles: 500, waveOpacity: 0.45 });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.legal-hero-title', { y: 40, autoAlpha: 0, duration: 1.2, ease: 'expo.out', delay: 0.2 });
      gsap.from('.legal-hero .eyebrow', { autoAlpha: 0, duration: 1, delay: 0.5 });
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
          <Picture src={image} alt="" sizes="100vw" priority />
        </div>
        <div className="hero-shade" />
        <div className="hero-ocean" ref={oceanHost} aria-hidden="true" />
        <div className="container legal-hero-inner">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="legal-hero-title">{title}</h1>
        </div>
      </section>

      <section className="section legal-body">
        <div className="container legal-grid">
          <nav className="legal-toc sr-left" aria-label="On this page">
            <span className="eyebrow">On this page</span>
            <ol>
              {sections.map((s) => (
                <li key={s.heading}>
                  <a href={`#${slug(s.heading)}`}>{s.heading}</a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="legal-content">
            {sections.map((s, i) => (
              <article key={s.heading} id={slug(s.heading)} className="legal-section sr-up">
                <span className="legal-num">{String(i + 1).padStart(2, '0')}</span>
                <h2 data-split>{s.heading}</h2>
                {s.paragraphs.map((p) => (
                  <Paragraph key={p} text={p} />
                ))}
              </article>
            ))}
            <a href="/" className="btn btn-navy legal-back sr-up">
              Back to Home
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

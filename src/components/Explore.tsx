import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { exploreGroups, exploreSection, type Feature } from '../content';
import { Camera } from './Icons';
import Picture from './Picture';

/** Every topic in order, so the arrows can step through all of them */
const topics = exploreGroups.flatMap((g, gi) => g.features.map((f, fi) => ({ group: gi, index: fi, feature: f })));
const flatIndex = (group: number, index: number) => topics.findIndex((t) => t.group === group && t.index === index);

/**
 * Mozambique, Paindane and Pleasure Bay in one place: a tab per place, chips for its topics, and one
 * photo + card panel that wipes to the next topic. Menu links to #paindane / #pleasure-bay open their tab.
 */
export default function Explore({ onOpenImage }: { onOpenImage: (src: string) => void }) {
  const [pos, setPos] = useState(0);
  const dir = useRef(1);
  const panel = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const { group, index, feature } = topics[pos];

  const go = (next: number) => {
    const n = (next + topics.length) % topics.length;
    if (n === pos) return;
    dir.current = n > pos ? 1 : -1;
    setPos(n);
  };

  // Links to a place (menu, footer) open its tab
  useEffect(() => {
    const open = (hash: string) => {
      const gi = exploreGroups.findIndex((g) => `#${g.id}` === hash);
      if (gi >= 0) setPos((p) => (topics[p].group === gi ? p : flatIndex(gi, 0)));
    };
    const onClick = (e: MouseEvent) => {
      const href = (e.target as HTMLElement).closest('a')?.getAttribute('href') ?? '';
      const hash = href.slice(href.indexOf('#'));
      if (href.includes('#')) open(hash);
    };
    open(window.location.hash);
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Wipe the photo in from the side we're heading to, then the card's contents rise in
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !panel.current) return;
    const ctx = gsap.context(() => {
      const d = dir.current;
      gsap
        .timeline()
        .fromTo(
          '.explore-media',
          { clipPath: d > 0 ? 'inset(0% 0% 0% 100% round 28px)' : 'inset(0% 100% 0% 0% round 28px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 0.9, ease: 'expo.inOut' },
        )
        .fromTo('.explore-media img', { scale: 1.25 }, { scale: 1, duration: 1.3, ease: 'expo.out' }, '<0.2')
        .fromTo('.explore-card', { rotate: d * 2, y: 30 }, { rotate: 0, y: 0, duration: 0.9, ease: 'back.out(1.6)' }, 0)
        .fromTo(
          '.explore-body > *',
          { y: 30, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out' },
          0.15,
        );
    }, panel);
    return () => ctx.revert();
  }, [pos]);

  return (
    <div className="container">
      {/* Anchors for the menu's Paindane / Pleasure Bay links */}
      {exploreGroups.slice(1).map((g) => (
        <span key={g.id} id={g.id} className="explore-anchor" aria-hidden="true" />
      ))}

      <div className="explore-top">
        <div className="explore-head">
          <span className="eyebrow">{exploreSection.eyebrow}</span>
          <h2 className="section-title" data-split>
            {exploreSection.title}
          </h2>
        </div>

        <div className="explore-tabs sr-up" role="tablist" aria-label="Places">
          {exploreGroups.map((g, gi) => (
            <button
              key={g.id}
              role="tab"
              aria-selected={group === gi}
              className={`explore-tab ${group === gi ? 'active' : ''}`}
              onClick={() => go(flatIndex(gi, 0))}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="explore-panel sr-up" ref={panel}>
        <button className="explore-media" onClick={() => onOpenImage(feature.image)} aria-label={`View photo: ${feature.title ?? feature.label}`}>
          <Picture key={feature.image + pos} src={feature.image} alt={feature.title ?? feature.label} sizes="(max-width: 960px) 100vw, 60vw" />
          <span className="feature-media-icon">
            <Camera width={26} height={26} />
          </span>
          <span className="explore-count">
            {String(pos + 1).padStart(2, '0')} / {String(topics.length).padStart(2, '0')}
          </span>
        </button>

        <div className={`explore-card tone-${feature.tone}`}>
          <div className="explore-chips" role="tablist" aria-label="Topics">
            {exploreGroups[group].features.map((f, fi) => (
              <button
                key={f.label}
                role="tab"
                aria-selected={index === fi}
                className={`explore-chip ${index === fi ? 'active' : ''}`}
                onClick={() => go(flatIndex(group, fi))}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="explore-body" key={pos}>
            <FeatureContent feature={feature} />
          </div>
          <div className="explore-arrows">
            <button onClick={() => go(pos - 1)} aria-label="Previous topic">
              ←
            </button>
            <button onClick={() => go(pos + 1)} aria-label="Next topic">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureContent({ feature: f }: { feature: Feature }) {
  return (
    <>
      <h3 className="explore-title">{f.title ?? f.label}</h3>
      {f.body.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {f.list && (
        <ul className="ticks">
          {f.list.map((li) => {
            const [head, ...rest] = li.split(':');
            return (
              <li key={li}>
                {rest.length ? (
                  <>
                    <strong>{head}:</strong>
                    {rest.join(':')}
                  </>
                ) : (
                  li
                )}
              </li>
            );
          })}
        </ul>
      )}
      {f.links && (
        <p>
          {f.links.before}
          {f.links.items.map((it) => (
            <span key={it.link.href}>
              <a href={it.link.href} target="_blank" rel="noreferrer">
                {it.link.label}
              </a>
              {it.after}
            </span>
          ))}
        </p>
      )}
      {f.subheading && <h4 className="subheading">{f.subheading}</h4>}
      {f.subLink && (
        <p>
          {f.subLink.before}
          <a href={f.subLink.link.href} target="_blank" rel="noreferrer">
            {f.subLink.link.label}
          </a>
          {f.subLink.after}
        </p>
      )}
      {f.footnote && <p className="footnote">{f.footnote}</p>}
    </>
  );
}

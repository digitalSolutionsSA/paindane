import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gallery } from '../content';
import Picture from './Picture';

gsap.registerPlugin(ScrollTrigger);

const STRIP = 8;

type Props = { onOpen: (index: number) => void };

/**
 * The first photos of the gallery on a horizontal track. On desktop the section pins and vertical
 * scrolling moves the track sideways (each photo drifting inside its frame); on phones it's a swipeable row.
 */
export default function GalleryStrip({ onOpen }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth + 64;
        const slide = gsap.to(el, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: wrap.current,
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
              if (count.current) count.current.textContent = String(Math.min(STRIP, Math.floor(self.progress * STRIP) + 1)).padStart(2, '0');
            },
          },
        });
        el.querySelectorAll('img').forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -12 },
            { xPercent: 12, ease: 'none', scrollTrigger: { trigger: img.parentElement, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true } },
          );
        });
      });
    }, wrap);
    return () => ctx.revert();
  }, []);

  return (
    <div className="strip" ref={wrap}>
      <div className="strip-head container">
        <h2 className="strip-title" data-split>
          Gallery
        </h2>
        <div className="strip-progress" aria-hidden="true">
          <span ref={count}>01</span>
          <i>
            <span ref={bar} />
          </i>
          <span>{String(STRIP).padStart(2, '0')}</span>
        </div>
      </div>
      <div className="strip-track" ref={track}>
        {gallery.slice(0, STRIP).map((src, i) => (
          <button key={src} className={`strip-item strip-item--${i % 3}`} onClick={() => onOpen(i)} aria-label={`Open photo ${i + 1}`}>
            <Picture src={src} alt="" sizes="(max-width: 899px) 80vw, 40vw" />
            <span className="strip-num">{String(i + 1).padStart(2, '0')}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Close, Left, Right } from './Icons';
import { startScroll, stopScroll } from '../lib/smoothScroll';
import { largestWebp } from './Picture';

type Props = {
  images: string[];
  index: number | null;
  onChange: (i: number | null) => void;
};

export default function Lightbox({ images, index, onChange }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const open = index !== null;

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null);
      if (e.key === 'ArrowRight') onChange((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onChange((index - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, images.length, onChange]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    stopScroll();
    if (rootRef.current) gsap.fromTo(rootRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
    return () => {
      document.body.style.overflow = '';
      startScroll();
    };
  }, [open]);

  useEffect(() => {
    if (imgRef.current) {
      gsap.fromTo(imgRef.current, { scale: 0.94, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'power3.out' });
    }
  }, [index]);

  if (index === null) return null;
  const go = (d: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange((index + d + images.length) % images.length);
  };

  return (
    <div className="lightbox" ref={rootRef} onClick={() => onChange(null)} role="dialog" aria-modal="true" aria-label="Image viewer">
      <button className="lb-btn lb-close" onClick={() => onChange(null)} aria-label="Close">
        <Close width={28} height={28} />
      </button>
      {images.length > 1 && (
        <button className="lb-btn lb-prev" onClick={go(-1)} aria-label="Previous">
          <Left width={32} height={32} />
        </button>
      )}
      <img ref={imgRef} src={largestWebp(images[index])} alt="" decoding="async" onClick={(e) => e.stopPropagation()} />
      {images.length > 1 && (
        <button className="lb-btn lb-next" onClick={go(1)} aria-label="Next">
          <Right width={32} height={32} />
        </button>
      )}
      {images.length > 1 && (
        <div className="lb-count">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

import type { CSSProperties, ImgHTMLAttributes } from 'react';
import manifest from '../data/imageManifest.json';

type Entry = { w: number; h: number; widths: number[]; base: string; blur: string };
const images = manifest as Record<string, Entry>;

/** Size info for an image path from content.ts (null if it hasn't been through `npm run images`) */
export const imageInfo = (src: string): Entry | null => images[src] ?? null;

/** URL of the optimised logo */
export const logoUrl = () => largestWebp('/images/logo.webp');

/** Largest generated WebP of an image, for CSS backgrounds and links */
export const largestWebp = (src: string) => {
  const e = images[src];
  return e ? `${e.base}-${e.widths[e.widths.length - 1]}.webp` : src;
};

const srcSet = (e: Entry, ext: string) => e.widths.map((w) => `${e.base}-${w}.${ext} ${w}w`).join(', ');

type ImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'width' | 'height'> & Record<`data-${string}`, unknown>;

interface Props {
  /** Original path, e.g. '/images/gallery/x.jpg' (as used in content.ts) */
  src: string;
  alt: string;
  /** How wide the image is shown, so the browser can pick the right file, e.g. '(max-width: 600px) 100vw, 50vw' */
  sizes: string;
  /** Above-the-fold image: load straight away with high priority */
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  img?: ImgProps;
}

/**
 * Responsive, modern-format image: AVIF → WebP at several widths, with the real width/height (no
 * layout jumps) and a tiny blurred preview that shows until the photo arrives.
 */
export default function Picture({ src, alt, sizes, priority, className, style, img }: Props) {
  const e = images[src];
  const imgStyle: CSSProperties | undefined = e
    ? { backgroundImage: `url("${e.blur}")`, backgroundSize: 'cover', backgroundPosition: 'center', ...img?.style }
    : img?.style;

  if (!e) {
    return <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" className={className} {...img} style={imgStyle} />;
  }

  const middle = e.widths[Math.min(1, e.widths.length - 1)];
  return (
    <picture className={className} style={style}>
      <source type="image/avif" srcSet={srcSet(e, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(e, 'webp')} sizes={sizes} />
      <img
        src={`${e.base}-${middle}.webp`}
        alt={alt}
        width={e.w}
        height={e.h}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        // React 18 doesn't know fetchPriority yet; pass it through as a plain attribute
        {...({ fetchpriority: priority ? 'high' : 'auto' } as Record<string, string>)}
        {...img}
        style={imgStyle}
      />
    </picture>
  );
}

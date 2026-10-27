import { useId } from 'react';

/**
 * Rolling waves (like the ones under the logo) along the bottom of a section, filled with the colour of
 * the section that follows so the two blend. The layers drift sideways on their own and the whole wave
 * rises like a tide as it scrolls into view (data-wave).
 */
export function WaveDivider({ color, tide = true }: { color: string; tide?: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="wave" data-wave={tide || undefined} viewBox="0 24 150 28" preserveAspectRatio="none" aria-hidden="true" style={{ color }}>
      <defs>
        <path id={id} d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z" />
      </defs>
      <g className="wave-layers">
        <use href={`#${id}`} x="48" y="0" fill="rgba(25, 168, 224, 0.35)" />
        <use href={`#${id}`} x="48" y="3" fill="rgba(255, 194, 26, 0.3)" />
        <use href={`#${id}`} x="48" y="5" fill="rgba(11, 106, 162, 0.25)" />
        <use href={`#${id}`} x="48" y="7" fill="currentColor" />
      </g>
    </svg>
  );
}

/** Smiling-sun style decoration from the logo: the rays turn as you scroll (data-spin). */
export function Sun({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <div className={`sun ${className}`} data-spin aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs>
          <radialGradient id={`${id}-core`} cx="40%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#fff2a8" />
            <stop offset="55%" stopColor="#ffc21a" />
            <stop offset="100%" stopColor="#ff8a1f" />
          </radialGradient>
        </defs>
        <g className="sun-rays">
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={i} d="M100 4 L112 40 L88 40 Z" fill="#ffb21f" transform={`rotate(${i * 30} 100 100)`} />
          ))}
        </g>
        <circle cx="100" cy="100" r="54" fill={`url(#${id}-core)`} />
        <circle cx="100" cy="100" r="54" fill="none" stroke="rgba(228, 96, 12, 0.35)" strokeWidth="3" />
      </svg>
    </div>
  );
}

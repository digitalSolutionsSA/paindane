import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import type { Unit } from './api';
import SiteMap, { type SiteMapProps } from './SiteMap';
import { MAP_SIZE, MAP_ZONES } from './units';

type Rect = { x: number; y: number; w: number; h: number };
type ZoneId = (typeof MAP_ZONES)[number]['id'];

interface Props extends Omit<SiteMapProps, 'svgRef' | 'onHover'> {
  onHover?: (u: Unit | null) => void;
  /** Content of the floating card next to the hovered unit */
  tooltip?: (u: Unit) => ReactNode;
  /** Zone to show first on narrow screens */
  mobileZone?: ZoneId;
}

const MIN_W = 300;
const DRAG_THRESHOLD = 6;

/**
 * The site map as something to explore: drag to pan, zoom with the buttons / pinch / Ctrl+scroll,
 * fly to an area, a gentle 3D tilt that follows the mouse in the overview, and a card beside the
 * hovered unit.
 */
export default function MapExplorer({ tooltip, onHover, mobileZone = 'camp', ...map }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const vb = useRef<Rect>({ x: 0, y: 0, w: MAP_SIZE.w, h: MAP_SIZE.h });
  const [zone, setZone] = useState<ZoneId | null>('all');
  const [zoomed, setZoomed] = useState(false);
  const [hint, setHint] = useState(true);
  const [hover, setHover] = useState<{ u: Unit; left: number; top: number; below: boolean } | null>(null);

  const aspect = () => {
    const el = svg.current;
    return el && el.clientHeight ? el.clientWidth / el.clientHeight : MAP_SIZE.w / MAP_SIZE.h;
  };
  /** Widest view that never shows past the top / bottom of the map */
  const maxW = () => Math.min(MAP_SIZE.w, MAP_SIZE.h * aspect());

  const clamp = useCallback((r: Rect): Rect => {
    const a = aspect();
    const w = gsap.utils.clamp(MIN_W, maxW(), r.w);
    const h = w / a;
    const x = w >= MAP_SIZE.w ? (MAP_SIZE.w - w) / 2 : gsap.utils.clamp(0, MAP_SIZE.w - w, r.x + (r.w - w) / 2);
    const y = h >= MAP_SIZE.h ? (MAP_SIZE.h - h) / 2 : gsap.utils.clamp(0, MAP_SIZE.h - h, r.y + (r.h - h) / 2);
    return { x, y, w, h };
  }, []);

  /** Grow a target area to the screen's shape so it fits completely */
  const fit = useCallback(
    (r: Rect): Rect => {
      const a = aspect();
      const out = r.w / r.h > a ? { ...r, h: r.w / a, y: r.y - (r.w / a - r.h) / 2 } : { ...r, w: r.h * a, x: r.x - (r.h * a - r.w) / 2 };
      return clamp(out);
    },
    [clamp],
  );

  const apply = useCallback(() => {
    const { x, y, w, h } = vb.current;
    svg.current?.setAttribute('viewBox', `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
    const isZoomed = w < maxW() - 1;
    setZoomed(isZoomed);
    if (isZoomed && tilt.current) gsap.to(tilt.current, { rotateX: 0, rotateY: 0, duration: 0.6, overwrite: 'auto' });
  }, []);

  const flyTo = useCallback(
    (target: Rect, duration = 1.1) => {
      setHover(null);
      const t = fit(target);
      gsap.to(vb.current, { ...t, duration, ease: 'power3.inOut', overwrite: true, onUpdate: apply });
    },
    [fit, apply],
  );

  const zoomBy = useCallback(
    (factor: number, cx?: number, cy?: number, animate = true) => {
      const cur = vb.current;
      const px = cx ?? cur.x + cur.w / 2;
      const py = cy ?? cur.y + cur.h / 2;
      const w = cur.w * factor;
      const h = cur.h * factor;
      const next = clamp({ x: px - (px - cur.x) * factor, y: py - (py - cur.y) * factor, w, h });
      setZone(null);
      setHover(null);
      if (animate) gsap.to(vb.current, { ...next, duration: 0.45, ease: 'power3.out', overwrite: true, onUpdate: apply });
      else {
        gsap.killTweensOf(vb.current);
        Object.assign(vb.current, next);
        apply();
      }
    },
    [clamp, apply],
  );

  /** Screen point → map coordinates */
  const toMap = (clientX: number, clientY: number) => {
    const r = svg.current!.getBoundingClientRect();
    const cur = vb.current;
    return { x: cur.x + ((clientX - r.left) / r.width) * cur.w, y: cur.y + ((clientY - r.top) / r.height) * cur.h };
  };

  // Start position: the whole resort, or one area on narrow screens
  useLayoutEffect(() => {
    const start = aspect() < 1.6 ? MAP_ZONES.find((z) => z.id === mobileZone)! : MAP_ZONES[0];
    vb.current = fit(start);
    setZone(start.id);
    apply();
    const ro = new ResizeObserver(() => {
      vb.current = clamp(vb.current);
      apply();
    });
    if (stage.current) ro.observe(stage.current);
    const t = window.setTimeout(() => setHint(false), 6000);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
      gsap.killTweensOf(vb.current);
    };
  }, [fit, clamp, apply, mobileZone]);

  // Drag to pan, pinch to zoom, Ctrl/⌘ + wheel to zoom
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const pointers = new Map<number, { x: number; y: number }>();
    let start: { x: number; y: number } | null = null;
    let dragging = false;
    let pinch = 0;

    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('.map-ui')) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) {
        start = { x: e.clientX, y: e.clientY };
        dragging = false;
      }
    };
    const move = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) {
          const mid = toMap((a.x + b.x) / 2, (a.y + b.y) / 2);
          zoomBy(pinch / dist, mid.x, mid.y, false);
        }
        pinch = dist;
        dragging = true;
        return;
      }

      if (!start) return;
      if (!dragging && Math.hypot(e.clientX - start.x, e.clientY - start.y) > DRAG_THRESHOLD) {
        dragging = true;
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-dragging');
        setHint(false);
        setHover(null);
        setZone(null);
      }
      if (dragging) {
        const r = svg.current!.getBoundingClientRect();
        const cur = vb.current;
        gsap.killTweensOf(vb.current);
        vb.current = clamp({ ...cur, x: cur.x - ((e.clientX - prev.x) / r.width) * cur.w, y: cur.y - ((e.clientY - prev.y) / r.height) * cur.h });
        apply();
      }
    };
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = 0;
      if (pointers.size === 0) {
        start = null;
        el.classList.remove('is-dragging');
        // Let the click that follows a drag know it should be ignored
        if (dragging) window.setTimeout(() => (dragging = false), 0);
      }
    };
    // A drag shouldn't also select the unit it ends on
    const click = (e: MouseEvent) => {
      if (dragging) {
        e.stopPropagation();
        e.preventDefault();
        dragging = false;
      }
    };
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setHint(false);
      const p = toMap(e.clientX, e.clientY);
      zoomBy(e.deltaY > 0 ? 1.15 : 1 / 1.15, p.x, p.y);
    };

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('click', click, true);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('click', click, true);
      el.removeEventListener('wheel', wheel);
    };
  }, [clamp, apply, zoomBy]);

  // Diorama tilt in the overview, following the mouse
  useEffect(() => {
    const el = stage.current;
    const t = tilt.current;
    if (!el || !t) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    gsap.set(t, { rotateX: 9, transformPerspective: 1600 });
    const rx = gsap.quickTo(t, 'rotateX', { duration: 0.8, ease: 'power3.out' });
    const ry = gsap.quickTo(t, 'rotateY', { duration: 0.8, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      if (zoomed || el.classList.contains('is-dragging')) return;
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      rx(9 - ny * 6);
      ry(nx * 6);
    };
    const leave = () => {
      if (zoomed) return;
      rx(9);
      ry(0);
    };
    if (!zoomed) leave();
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [zoomed]);

  const onUnitHover = (u: Unit | null, target?: SVGGElement) => {
    onHover?.(u);
    if (!u || !target || !stage.current || !tooltip) {
      setHover(null);
      return;
    }
    const s = stage.current.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    const top = r.top - s.top;
    setHover({ u, left: gsap.utils.clamp(110, s.width - 110, r.left - s.left + r.width / 2), top: top < 170 ? r.bottom - s.top + 10 : top - 10, below: top < 170 });
  };

  return (
    <div className="map-explorer">
        <div className="map-zones" role="toolbar" aria-label="Map areas">
          {MAP_ZONES.map((z) => (
            <button
              key={z.id}
              type="button"
              className={zone === z.id ? 'active' : ''}
              onClick={() => {
                setZone(z.id);
                setHint(false);
                flyTo(z);
              }}
            >
              {z.label}
            </button>
          ))}
        </div>

    <div className={`map-stage ${zoomed ? 'is-zoomed' : ''}`} ref={stage}>
      <div className="map-tilt" ref={tilt}>
        <SiteMap {...map} svgRef={svg} onHover={onUnitHover} />
      </div>

      {hover && tooltip && (
        <div className={`map-tip ${hover.below ? 'is-below' : ''}`} style={{ left: hover.left, top: hover.top }} role="status">
          {tooltip(hover.u)}
        </div>
      )}

      <div className="map-ui map-zoom" role="toolbar" aria-label="Zoom">
        <button type="button" onClick={() => zoomBy(1 / 1.4)} aria-label="Zoom in">
          +
        </button>
        <button type="button" onClick={() => zoomBy(1.4)} aria-label="Zoom out">
          −
        </button>
        <button
          type="button"
          onClick={() => {
            setZone('all');
            flyTo(MAP_ZONES[0]);
          }}
          aria-label="Show the whole resort"
        >
          ⤢
        </button>
      </div>

      <div className={`map-ui map-hint ${hint ? '' : 'is-hidden'}`} aria-hidden="true">
        Drag to explore · pinch or Ctrl + scroll to zoom
      </div>
    </div>
    </div>
  );
}

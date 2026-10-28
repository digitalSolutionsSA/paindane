import { useEffect, useMemo, useRef, useState } from 'react';
import { scrollToTarget } from '../lib/smoothScroll';

/*
 * Arrival/departure picker for the enquiry form. Browsers' own date pop-ups can't be resized, so on larger
 * screens this shows a big calendar instead (two months side by side on wide screens): click the arrival
 * day, then the departure day, and the stay is highlighted with a night count. Phones keep their native
 * date picker, which is already full-screen there. Dates are ISO strings (YYYY-MM-DD).
 */

type Props = {
  arrival: string;
  departure: string;
  onChange: (arrival: string, departure: string) => void;
};

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const iso = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
const todayIso = () => {
  const n = new Date();
  return iso(n.getFullYear(), n.getMonth(), n.getDate());
};
const addDays = (s: string, days: number) => {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const nightsBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const label = (s: string, opts: Intl.DateTimeFormatOptions) => new Date(`${s}T12:00:00Z`).toLocaleDateString('en-ZA', { ...opts, timeZone: 'UTC' });
const short = (s: string) => label(s, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    // Some browsers (and device emulators) skip the media query event, so listen for resizes too
    mq.addEventListener('change', on);
    window.addEventListener('resize', on);
    return () => {
      mq.removeEventListener('change', on);
      window.removeEventListener('resize', on);
    };
  }, [query]);
  return match;
}

/** The days of one month, padded so the grid starts on a Monday */
function monthDays(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay(); // 0 = Sunday
  const lead = (first + 6) % 7;
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [...Array<null>(lead).fill(null), ...Array.from({ length: count }, (_, i) => iso(year, month, i + 1))];
}

export default function DateRangePicker({ arrival, departure, onChange }: Props) {
  const big = useMedia('(min-width: 700px)');
  const twoMonths = useMedia('(min-width: 1000px)');
  const today = todayIso();

  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState<'arrival' | 'departure'>('arrival');
  const [hover, setHover] = useState('');
  const start = arrival || today;
  const [view, setView] = useState(() => ({ y: Number(start.slice(0, 4)), m: Number(start.slice(5, 7)) - 1 }));
  const root = useRef<HTMLDivElement>(null);

  // When it opens, glide just far enough that the whole calendar is on screen (fields stay below the header)
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      const panel = root.current?.querySelector('.drp-panel');
      const top = root.current?.getBoundingClientRect().top;
      if (!panel || top === undefined) return;
      const overflow = panel.getBoundingClientRect().bottom - (window.innerHeight - 16);
      if (overflow > 0) scrollToTarget(window.scrollY + Math.min(overflow, Math.max(0, top - 90)));
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  // Close on a click outside or Escape
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('keydown', key);
    };
  }, [open]);

  const openAt = (which: 'arrival' | 'departure') => {
    setPicking(which === 'departure' && !arrival ? 'arrival' : which);
    const focus = (which === 'departure' && departure) || arrival || today;
    setView({ y: Number(focus.slice(0, 4)), m: Number(focus.slice(5, 7)) - 1 });
    setOpen(true);
  };

  const pick = (day: string) => {
    if (picking === 'arrival' || !arrival || day <= arrival) {
      onChange(day, departure && departure > day ? departure : '');
      setPicking('departure');
      return;
    }
    onChange(arrival, day);
    setPicking('arrival');
    window.setTimeout(() => setOpen(false), 250);
  };

  const shift = (n: number) => setView(({ y, m }) => ({ y: y + Math.floor((m + n) / 12), m: (((m + n) % 12) + 12) % 12 }));
  const atCurrentMonth = view.y === Number(today.slice(0, 4)) && view.m === Number(today.slice(5, 7)) - 1;

  // While choosing the departure, preview the stay up to the hovered day
  const rangeEnd = departure || (picking === 'departure' && hover > arrival ? hover : '');
  const nights = arrival && departure ? nightsBetween(arrival, departure) : 0;

  const months = useMemo(
    () => Array.from({ length: twoMonths ? 2 : 1 }, (_, i) => ({ y: view.y + Math.floor((view.m + i) / 12), m: (view.m + i) % 12 })),
    [view, twoMonths],
  );

  // Phones: the browser's own (full-screen) date pickers
  if (!big) {
    return (
      <div className="grid-2">
        <label className="field">
          <span>Arrival *</span>
          <input type="date" required min={today} value={arrival} onChange={(e) => onChange(e.target.value, departure > e.target.value ? departure : '')} />
        </label>
        <label className="field">
          <span>Departure *</span>
          <input type="date" required min={arrival ? addDays(arrival, 1) : today} value={departure} onChange={(e) => onChange(arrival, e.target.value)} />
        </label>
        <input type="hidden" name="arrival" value={arrival} />
        <input type="hidden" name="departure" value={departure} />
      </div>
    );
  }

  return (
    <div className="drp" ref={root}>
      <div className="grid-2">
        {(['arrival', 'departure'] as const).map((which) => {
          const value = which === 'arrival' ? arrival : departure;
          return (
            <div className="field" key={which}>
              <span>{which === 'arrival' ? 'Arrival *' : 'Departure *'}</span>
              <button
                type="button"
                className={`drp-trigger ${open && picking === which ? 'is-active' : ''} ${value ? '' : 'is-empty'}`}
                onClick={() => openAt(which)}
                aria-haspopup="dialog"
                aria-expanded={open}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                {value ? short(value) : 'Choose a date'}
              </button>
            </div>
          );
        })}
      </div>
      <input type="hidden" name="arrival" value={arrival} />
      <input type="hidden" name="departure" value={departure} />

      {open && (
        <div className="drp-panel" role="dialog" aria-label="Choose your dates">
          <p className="drp-hint">{picking === 'arrival' ? 'Choose your arrival date' : 'Now choose your departure date'}</p>
          <div className="drp-nav">
            <button type="button" onClick={() => shift(-1)} disabled={atCurrentMonth} aria-label="Previous month">
              ←
            </button>
            <button type="button" onClick={() => shift(1)} aria-label="Next month">
              →
            </button>
          </div>
          <div className="drp-months" onMouseLeave={() => setHover('')}>
            {months.map(({ y, m }) => (
              <div className="drp-month" key={`${y}-${m}`}>
                <h4>{label(iso(y, m, 1), { month: 'long', year: 'numeric' })}</h4>
                <div className="drp-grid">
                  {WEEKDAYS.map((w) => (
                    <span key={w} className="drp-wd">
                      {w}
                    </span>
                  ))}
                  {monthDays(y, m).map((day, i) => {
                    if (!day) return <span key={`pad-${i}`} />;
                    const past = day < today;
                    const isStart = day === arrival;
                    const isEnd = day === rangeEnd;
                    const inRange = arrival && rangeEnd && day > arrival && day < rangeEnd;
                    return (
                      <button
                        type="button"
                        key={day}
                        disabled={past}
                        className={[
                          'drp-day',
                          isStart && 'is-start',
                          isEnd && 'is-end',
                          inRange && 'in-range',
                          day === today && 'is-today',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => pick(day)}
                        onMouseEnter={() => setHover(day)}
                        aria-label={label(day, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        aria-pressed={isStart || isEnd}
                      >
                        {Number(day.slice(8))}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="drp-foot">
            <span>
              {arrival && departure
                ? `${short(arrival)} → ${short(departure)} · ${nights} night${nights === 1 ? '' : 's'}`
                : arrival
                  ? `Arriving ${short(arrival)}`
                  : 'No dates chosen yet'}
            </span>
            <div>
              {(arrival || departure) && (
                <button
                  type="button"
                  className="drp-clear"
                  onClick={() => {
                    onChange('', '');
                    setPicking('arrival');
                  }}
                >
                  Clear
                </button>
              )}
              <button type="button" className="btn btn-navy drp-done" onClick={() => setOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

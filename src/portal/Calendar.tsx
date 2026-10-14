import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, formatMonth, resortToday, weekdayShort } from '../booking/dates';
import { useUnitsAndRates } from '../booking/hooks';
import { CATEGORIES, RESORTS, type ResortId } from '../booking/units';
import { listNights, type NightRow } from './admin';

const monthStart = (iso: string) => iso.slice(0, 8) + '01';
const shiftMonth = (iso: string, n: number) => {
  const d = new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1 + n, 1));
  return d.toISOString().slice(0, 10);
};

/** Occupancy grid: one row per unit, one column per night of the month */
export default function Calendar({ onOpen }: { onOpen: (id: string) => void }) {
  const { units } = useUnitsAndRates();
  const today = resortToday();
  const [month, setMonth] = useState(monthStart(today));
  const [resort, setResort] = useState<ResortId>('paindane');
  const [nights, setNights] = useState<NightRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => {
    const next = shiftMonth(month, 1);
    const out: string[] = [];
    for (let d = month; d < next; d = addDays(d, 1)) out.push(d);
    return out;
  }, [month]);

  const load = useCallback(async () => {
    try {
      setNights(await listNights(days[0], days[days.length - 1]));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [days]);

  useEffect(() => {
    setNights(null);
    load();
    const t = window.setInterval(load, 30_000);
    return () => window.clearInterval(t);
  }, [load]);

  const byKey = useMemo(() => new Map((nights ?? []).map((n) => [`${n.unit_id}|${n.night}`, n])), [nights]);
  const rows = (units ?? []).filter((u) => u.resort === resort);

  const cellClass = (n?: NightRow) => {
    if (!n?.booking) return '';
    if (n.status === 'held') return n.expires_at && new Date(n.expires_at) < new Date() ? 'is-lapsed' : 'is-held';
    if (n.booking.checked_in_at) return 'is-in';
    return n.booking.status === 'paid' ? 'is-paid' : 'is-confirmed';
  };

  const occupied = days.map((d) => rows.filter((u) => byKey.get(`${u.id}|${d}`)?.status === 'booked').length);

  return (
    <div className="pt-card">
      <div className="pt-toolbar">
        <div className="pt-month">
          <button className="pt-btn pt-btn-ghost" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month">
            ‹
          </button>
          <h2>{formatMonth(month)}</h2>
          <button className="pt-btn pt-btn-ghost" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month">
            ›
          </button>
          <button className="pt-link" onClick={() => setMonth(monthStart(today))}>
            Today
          </button>
        </div>
        <div className="pt-filters">
          {RESORTS.map((r) => (
            <button key={r.id} className={`pt-chip ${resort === r.id ? 'active' : ''}`} onClick={() => setResort(r.id)}>
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <ul className="pt-legend">
        <li><span className="is-held" /> Request (held)</li>
        <li><span className="is-lapsed" /> Request (hold expired)</li>
        <li><span className="is-confirmed" /> Confirmed</li>
        <li><span className="is-paid" /> Paid</li>
        <li><span className="is-in" /> Checked in</li>
      </ul>

      {error && <p className="pt-error">{error}</p>}
      <div className="pt-cal-wrap">
        <table className="pt-cal">
          <thead>
            <tr>
              <th className="pt-cal-unit">Unit</th>
              {days.map((d) => (
                <th key={d} className={d === today ? 'is-today' : ''}>
                  <small>{weekdayShort(d)}</small>
                  {+d.slice(8)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <th className="pt-cal-unit">
                  <span className="pt-swatch" style={{ background: CATEGORIES[u.category]?.color }} />
                  {u.name}
                </th>
                {days.map((d, i) => {
                  const n = byKey.get(`${u.id}|${d}`);
                  const prev = i > 0 ? byKey.get(`${u.id}|${days[i - 1]}`) : undefined;
                  const starts = n?.booking && prev?.booking?.id !== n.booking.id;
                  return (
                    <td key={d} className={`${cellClass(n)} ${d === today ? 'is-today' : ''}`}>
                      {n?.booking && (
                        <button onClick={() => onOpen(n.booking!.id)} title={`${n.booking.ref} – ${n.booking.name}`} aria-label={`${u.name} ${d}: ${n.booking.name}`}>
                          {starts ? n.booking.name.split(' ')[0] : ''}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th className="pt-cal-unit">Booked</th>
              {occupied.map((c, i) => (
                <td key={days[i]}>{c || ''}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
      {!nights && !error && <p className="pt-muted">Loading…</p>}
    </div>
  );
}

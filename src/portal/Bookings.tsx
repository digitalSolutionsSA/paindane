import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatRand, formatShortDate, nightsBetween, resortToday } from '../booking/dates';
import { useUnitsAndRates } from '../booking/hooks';
import { RESORTS } from '../booking/units';
import { holdExpired, listBookings, sourceLabels, statusLabels, type Booking } from './admin';

const REFRESH_MS = 30_000;

type Filter = 'requests' | 'arriving' | 'in-house' | 'upcoming' | 'past' | 'cancelled' | 'all';

const isLive = (b: Booking) => b.status === 'confirmed' || b.status === 'paid';

const filters: { id: Filter; label: string; test: (b: Booking, today: string) => boolean }[] = [
  { id: 'requests', label: 'Requests', test: (b) => b.status === 'pending' },
  { id: 'arriving', label: 'Arriving today', test: (b, t) => isLive(b) && b.check_in === t },
  { id: 'in-house', label: 'In house', test: (b, t) => isLive(b) && b.check_in <= t && b.check_out > t },
  { id: 'upcoming', label: 'Upcoming', test: (b, t) => (isLive(b) || b.status === 'pending') && b.check_out >= t },
  { id: 'past', label: 'Past', test: (b, t) => isLive(b) && b.check_out < t },
  { id: 'cancelled', label: 'Cancelled', test: (b) => b.status === 'cancelled' || b.status === 'declined' },
  { id: 'all', label: 'All', test: () => true },
];

export function StatusBadge({ b }: { b: Booking }) {
  if (holdExpired(b)) return <span className="pt-badge is-expired">Hold expired</span>;
  if (b.checked_in_at && isLive(b)) return <span className="pt-badge is-in">Checked in</span>;
  return <span className={`pt-badge is-${b.status}`}>{statusLabels[b.status]}</span>;
}

export default function Bookings({ onOpen }: { onOpen: (id: string) => void }) {
  const { units } = useUnitsAndRates();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('requests');
  const [resort, setResort] = useState<'all' | (typeof RESORTS)[number]['id']>('all');
  const [query, setQuery] = useState('');
  const today = resortToday();

  const unitName = useMemo(() => new Map((units ?? []).map((u) => [u.id, u.name])), [units]);

  const load = useCallback(async () => {
    try {
      setBookings(await listBookings());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
    const t = window.setInterval(load, REFRESH_MS);
    window.addEventListener('focus', load);
    return () => {
      window.clearInterval(t);
      window.removeEventListener('focus', load);
    };
  }, [load]);

  const counts = useMemo(
    () => Object.fromEntries(filters.map((f) => [f.id, (bookings ?? []).filter((b) => f.test(b, today)).length])),
    [bookings, today],
  );

  const shown = useMemo(() => {
    const f = filters.find((x) => x.id === filter)!;
    const needle = query.trim().toLowerCase();
    const digits = query.replace(/\D/g, '');
    let list = (bookings ?? []).filter((b) => f.test(b, today) && (resort === 'all' || b.resort === resort));
    if (needle) {
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(needle) ||
          b.ref.toLowerCase().includes(needle) ||
          (b.email ?? '').toLowerCase().includes(needle) ||
          (digits.length >= 3 && (b.phone ?? '').replace(/\D/g, '').includes(digits)) ||
          b.unit_ids.some((id) => (unitName.get(id) ?? id).toLowerCase().includes(needle)),
      );
    }
    // Requests: oldest first so nothing waits too long. Past: most recent first.
    if (filter === 'requests') list = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
    if (filter === 'past' || filter === 'cancelled' || filter === 'all') list = [...list].sort((a, b) => b.check_in.localeCompare(a.check_in));
    return list;
  }, [bookings, filter, resort, query, today, unitName]);

  return (
    <div className="pt-card">
      <div className="pt-toolbar">
        <div className="pt-filters">
          {filters.map((f) => (
            <button key={f.id} className={`pt-chip ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
              {f.label}
              {f.id !== 'all' && counts[f.id] > 0 && <span className="pt-count">{counts[f.id]}</span>}
            </button>
          ))}
        </div>
        <div className="pt-toolbar-right">
          <select value={resort} onChange={(e) => setResort(e.target.value as typeof resort)} aria-label="Resort">
            <option value="all">Both resorts</option>
            {RESORTS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <input type="search" placeholder="Search name, ref, phone, unit…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search bookings" />
        </div>
      </div>

      {error && <p className="pt-error">{error}</p>}
      {!bookings ? (
        <p className="pt-muted">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="pt-muted pt-empty">Nothing here.</p>
      ) : (
        <div className="pt-table-wrap">
          <table className="pt-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Stay</th>
                <th>Units</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((b) => (
                <tr key={b.id} onClick={() => onOpen(b.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onOpen(b.id)}>
                  <td>
                    <strong>{b.name}</strong>
                    <small>
                      {b.ref} · {b.adults + b.children} guest{b.adults + b.children === 1 ? '' : 's'}
                    </small>
                  </td>
                  <td>
                    {formatShortDate(b.check_in)} → {formatShortDate(b.check_out)}
                    <small>
                      {nightsBetween(b.check_in, b.check_out)} nights · {RESORTS.find((r) => r.id === b.resort)?.name}
                    </small>
                  </td>
                  <td className="pt-units">{b.unit_ids.map((id) => unitName.get(id) ?? id).join(', ')}</td>
                  <td>{formatRand(b.amount_cents)}</td>
                  <td>
                    <StatusBadge b={b} />
                  </td>
                  <td>{sourceLabels[b.source]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { stayPrice, type Unit } from '../booking/api';
import { addDays, formatRand, nightsBetween, resortToday } from '../booking/dates';
import { useAvailability, useUnitsAndRates } from '../booking/hooks';
import MapExplorer from '../booking/MapExplorer';
import type { UnitState } from '../booking/SiteMap';
import UnitList from '../booking/UnitList';
import { RESORTS, type ResortId } from '../booking/units';
import { createManualBooking, sourceLabels, type BookingSource } from './admin';

/** A booking taken by phone, WhatsApp or at reception. Staff can also book units that aren't bookable online. */
export default function NewBooking({ onCreated }: { onCreated: (id: string) => void }) {
  const { units, peaks } = useUnitsAndRates();
  const today = resortToday();
  const [resort, setResort] = useState<ResortId>('paindane');
  const [view, setView] = useState<'map' | 'list'>('map');
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(addDays(today, 1));
  const [selected, setSelected] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', adults: 2, children: 0, source: 'phone' as BookingSource, paid: false, notes: '' });
  const [amount, setAmount] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { unavailable, ready, markTaken } = useAvailability(checkIn, checkOut);
  const resortUnits = (units ?? []).filter((u) => u.resort === resort);
  const chosen = useMemo(() => (units ?? []).filter((u) => selected.includes(u.id)), [units, selected]);
  const estimate = ready ? stayPrice(chosen, checkIn, checkOut, peaks) : 0;

  useEffect(() => {
    if (!amountTouched) setAmount(estimate ? String(Math.round(estimate / 100)) : '');
  }, [estimate, amountTouched]);

  useEffect(() => {
    setSelected((s) => s.filter((id) => !unavailable.has(id)));
  }, [unavailable]);

  const stateOf = (u: Unit): UnitState => (unavailable.has(u.id) ? 'taken' : selected.includes(u.id) ? 'selected' : 'free');
  const toggle = (u: Unit) => setSelected((s) => (s.includes(u.id) ? s.filter((id) => id !== u.id) : [...s, u.id]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const id = await createManualBooking({
        resort,
        unitIds: selected,
        checkIn,
        checkOut,
        adults: form.adults,
        children: form.children,
        name: form.name,
        email: form.email,
        phone: form.phone,
        source: form.source,
        paid: form.paid,
        amountCents: amount === '' ? null : Math.round(Number(amount) * 100),
        notes: form.notes,
      });
      onCreated(id);
    } catch (err) {
      const message = (err as Error).message;
      const taken = message.match(/Already booked on some of those nights: (.*)$/)?.[1];
      if (taken) markTaken(taken.split(', '));
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="pt-new" onSubmit={submit}>
      <div className="pt-card">
        <div className="pt-toolbar">
          <div className="pt-filters">
            {RESORTS.map((r) => (
              <button
                type="button"
                key={r.id}
                className={`pt-chip ${resort === r.id ? 'active' : ''}`}
                onClick={() => {
                  setResort(r.id);
                  setSelected([]);
                  setView(r.id === 'paindane' ? 'map' : 'list');
                }}
              >
                {r.name}
              </button>
            ))}
            {resort === 'paindane' && (
              <button type="button" className="pt-chip" onClick={() => setView(view === 'map' ? 'list' : 'map')}>
                {view === 'map' ? 'Show list' : 'Show map'}
              </button>
            )}
          </div>
          <div className="pt-toolbar-right">
            <label className="pt-field pt-inline">
              <span>Check in</span>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (checkOut <= e.target.value) setCheckOut(addDays(e.target.value, 1));
                }}
              />
            </label>
            <label className="pt-field pt-inline">
              <span>Check out</span>
              <input type="date" required min={addDays(checkIn, 1)} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </label>
            <span className="pt-muted">{nightsBetween(checkIn, checkOut)} nights</span>
          </div>
        </div>
        {!units ? (
          <p className="pt-muted">Loading…</p>
        ) : view === 'map' && resort === 'paindane' ? (
          <MapExplorer units={resortUnits} stateOf={stateOf} onToggle={toggle} tooltip={(u) => <strong>{u.name}</strong>} />
        ) : (
          <UnitList units={resortUnits} stateOf={stateOf} onToggle={toggle} priceOf={(u) => (ready ? stayPrice([u], checkIn, checkOut, peaks) : null)} />
        )}
        <p className="pt-muted pt-small">Units marked “not bookable online” can still be booked here.</p>
      </div>

      <div className="pt-card">
        <h2>Guest</h2>
        <div className="pt-grid">
          <label className="pt-field">
            <span>Name *</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="pt-field">
            <span>Cellular</span>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="pt-field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="pt-field">
            <span>Booked via</span>
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as BookingSource })}>
              {Object.entries(sourceLabels)
                .filter(([k]) => k !== 'online')
                .map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
            </select>
          </label>
          <label className="pt-field">
            <span>Adults</span>
            <input type="number" min={1} value={form.adults} onChange={(e) => setForm({ ...form, adults: Number(e.target.value) })} />
          </label>
          <label className="pt-field">
            <span>Children</span>
            <input type="number" min={0} value={form.children} onChange={(e) => setForm({ ...form, children: Number(e.target.value) })} />
          </label>
          <label className="pt-field">
            <span>Amount due (R)</span>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => {
                setAmountTouched(true);
                setAmount(e.target.value);
              }}
            />
          </label>
          <label className="pt-check">
            <input type="checkbox" checked={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.checked })} />
            Already paid
          </label>
        </div>
        <label className="pt-field">
          <span>Notes</span>
          <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>
        {error && <p className="pt-error">{error}</p>}
        <div className="pt-actions">
          <span className="pt-muted">
            {chosen.length ? chosen.map((u) => u.name).join(', ') : 'No units chosen'} · estimate {formatRand(estimate)}
          </span>
          <button className="pt-btn pt-btn-primary" disabled={busy || !chosen.length || !ready}>
            {busy ? 'Saving…' : 'Create booking'}
          </button>
        </div>
      </div>
    </form>
  );
}

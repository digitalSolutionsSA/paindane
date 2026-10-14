import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Unit } from '../booking/api';
import { formatDate } from '../booking/dates';
import { useUnitsAndRates } from '../booking/hooks';
import { CATEGORIES, RESORTS } from '../booking/units';
import { addPeakPeriod, deletePeakPeriod, updateUnit } from './admin';

type Draft = { rate: string; peak: string; active: boolean };

const toDraft = (u: Unit): Draft => ({
  rate: String(Math.round(u.rate_cents / 100)),
  peak: u.peak_rate_cents == null ? '' : String(Math.round(u.peak_rate_cents / 100)),
  active: u.is_active,
});

/** Nightly rates per unit, "bookable online", and the peak periods */
export default function Rates() {
  const [reload, setReload] = useState(0);
  const { units, peaks } = useUnitsAndRates(reload);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [bulk, setBulk] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [peak, setPeak] = useState({ name: '', start: '', end: '' });

  useEffect(() => {
    if (units) setDrafts(Object.fromEntries(units.map((u) => [u.id, toDraft(u)])));
  }, [units]);

  const changed = useMemo(
    () => (units ?? []).filter((u) => drafts[u.id] && JSON.stringify(drafts[u.id]) !== JSON.stringify(toDraft(u))),
    [units, drafts],
  );

  const set = (id: string, patch: Partial<Draft>) => setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));

  const save = async () => {
    setBusy(true);
    setMessage(null);
    try {
      for (const u of changed) {
        const d = drafts[u.id];
        await updateUnit(u.id, {
          rate_cents: Math.round(Number(d.rate || 0) * 100),
          peak_rate_cents: d.peak === '' ? null : Math.round(Number(d.peak) * 100),
          is_active: d.active,
        });
      }
      setMessage({ ok: true, text: `Saved ${changed.length} unit${changed.length === 1 ? '' : 's'}.` });
      setReload((r) => r + 1);
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const addPeak = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addPeakPeriod(peak.name, peak.start, peak.end);
      setPeak({ name: '', start: '', end: '' });
      setReload((r) => r + 1);
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const removePeak = async (id: string) => {
    if (!window.confirm('Remove this peak period?')) return;
    try {
      await deletePeakPeriod(id);
      setReload((r) => r + 1);
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    }
  };

  if (!units) return <p className="pt-muted">Loading…</p>;

  return (
    <div className="pt-rates">
      <div className="pt-card">
        <div className="pt-toolbar">
          <div>
            <h2>Nightly rates</h2>
            <p className="pt-muted pt-small">Price per unit / campsite per night, in rand. Leave the peak rate empty to charge the normal rate in peak periods.</p>
          </div>
          <div className="pt-toolbar-right">
            {message && <span className={message.ok ? 'pt-ok' : 'pt-error'}>{message.text}</span>}
            <button className="pt-btn pt-btn-primary" disabled={busy || !changed.length} onClick={save}>
              {busy ? 'Saving…' : changed.length ? `Save ${changed.length} change${changed.length === 1 ? '' : 's'}` : 'No changes'}
            </button>
          </div>
        </div>

        {RESORTS.map((r) =>
          Object.keys(CATEGORIES)
            .map((c) => ({ c, list: units.filter((u) => u.resort === r.id && u.category === c) }))
            .filter((g) => g.list.length)
            .map(({ c, list }) => {
              const key = `${r.id}|${c}`;
              return (
                <section key={key} className="pt-rate-group">
                  <div className="pt-rate-head">
                    <h3>
                      <span className="pt-swatch" style={{ background: CATEGORIES[c].color }} />
                      {r.name} · {c}
                    </h3>
                    <div className="pt-bulk">
                      <input
                        type="number"
                        min={0}
                        placeholder="R per night"
                        value={bulk[key] ?? ''}
                        onChange={(e) => setBulk({ ...bulk, [key]: e.target.value })}
                        aria-label={`Rate for all ${c}`}
                      />
                      <button
                        type="button"
                        className="pt-btn pt-btn-ghost"
                        disabled={!bulk[key]}
                        onClick={() => list.forEach((u) => set(u.id, { rate: bulk[key] }))}
                      >
                        Set for all {list.length}
                      </button>
                    </div>
                  </div>
                  <table className="pt-table pt-rate-table">
                    <thead>
                      <tr>
                        <th>Unit</th>
                        <th>Sleeps</th>
                        <th>Rate (R)</th>
                        <th>Peak rate (R)</th>
                        <th>Bookable online</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((u) => {
                        const d = drafts[u.id];
                        if (!d) return null;
                        return (
                          <tr key={u.id} className={changed.includes(u) ? 'is-dirty' : ''}>
                            <td>{u.name}</td>
                            <td>{u.sleeps ?? '–'}</td>
                            <td>
                              <input type="number" min={0} value={d.rate} onChange={(e) => set(u.id, { rate: e.target.value })} aria-label={`${u.name} rate`} />
                            </td>
                            <td>
                              <input type="number" min={0} value={d.peak} placeholder="same" onChange={(e) => set(u.id, { peak: e.target.value })} aria-label={`${u.name} peak rate`} />
                            </td>
                            <td>
                              <input type="checkbox" checked={d.active} onChange={(e) => set(u.id, { active: e.target.checked })} aria-label={`${u.name} bookable online`} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>
              );
            }),
        )}
      </div>

      <div className="pt-card">
        <h2>Peak periods</h2>
        <p className="pt-muted pt-small">Nights from the start date to the end date (both included) are charged at the peak rate.</p>
        {peaks.length === 0 ? (
          <p className="pt-muted">No peak periods yet.</p>
        ) : (
          <ul className="pt-peaks">
            {peaks.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong>
                <span>
                  {formatDate(p.start_date)} – {formatDate(p.end_date)}
                </span>
                <button className="pt-link pt-danger" onClick={() => removePeak(p.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <form className="pt-grid pt-peak-form" onSubmit={addPeak}>
          <label className="pt-field">
            <span>Name</span>
            <input required placeholder="e.g. December holidays" value={peak.name} onChange={(e) => setPeak({ ...peak, name: e.target.value })} />
          </label>
          <label className="pt-field">
            <span>First night</span>
            <input type="date" required value={peak.start} onChange={(e) => setPeak({ ...peak, start: e.target.value })} />
          </label>
          <label className="pt-field">
            <span>Last night</span>
            <input type="date" required min={peak.start} value={peak.end} onChange={(e) => setPeak({ ...peak, end: e.target.value })} />
          </label>
          <button className="pt-btn pt-btn-primary" disabled={busy}>
            Add peak period
          </button>
        </form>
      </div>
    </div>
  );
}

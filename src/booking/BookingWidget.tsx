import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { BOOK_UNIT_EVENT, takePendingBook } from './bookEvents';
import { contact } from '../content';
import { requestBooking, stayPrice, type Unit } from './api';
import { addDays, formatDate, formatRand, nightsBetween, resortToday } from './dates';
import { useAvailability, useUnitsAndRates } from './hooks';
import MapExplorer from './MapExplorer';
import type { UnitState } from './SiteMap';
import UnitList from './UnitList';
import './booking.css';
import { scrollToTarget } from '../lib/smoothScroll';
import { CATEGORIES, RESORTS, type ResortId } from './units';

type Step = 'choose' | 'details' | 'done';

function Stepper({ label, value, min, onChange }: { label: string; value: number; min: number; onChange: (n: number) => void }) {
  return (
    <div className="bw-stepper">
      <span>{label}</span>
      <div>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min}>
          −
        </button>
        <output aria-live="polite">{value}</output>
        <button type="button" onClick={() => onChange(Math.min(40, value + 1))} aria-label={`More ${label.toLowerCase()}`}>
          +
        </button>
      </div>
    </div>
  );
}

export default function BookingWidget() {
  const { units, peaks } = useUnitsAndRates();
  const [resort, setResort] = useState<ResortId>('paindane');
  const [view, setView] = useState<'map' | 'list'>('map');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState<Step>('choose');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ref: string; amountCents: number; holdExpiresAt: string } | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [guest, setGuest] = useState({ name: '', email: '', phone: '', notes: '' });

  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);

  const today = resortToday();
  const nights = nightsBetween(checkIn, checkOut);
  const { unavailable, loading, ready, markTaken } = useAvailability(checkIn, checkOut);

  const resortUnits = useMemo(() => (units ?? []).filter((u) => u.resort === resort), [units, resort]);
  const selectedUnits = useMemo(() => (units ?? []).filter((u) => selected.includes(u.id)), [units, selected]);
  const total = ready ? stayPrice(selectedUnits, checkIn, checkOut, peaks) : 0;
  const sleeps = selectedUnits.reduce((s, u) => s + (u.sleeps ?? 0), 0);
  const hasCampsites = selectedUnits.some((u) => !u.sleeps);

  const stateOf = useCallback(
    (u: Unit): UnitState => (!u.is_active ? 'inactive' : unavailable.has(u.id) ? 'taken' : selected.includes(u.id) ? 'selected' : 'free'),
    [unavailable, selected],
  );

  const toggle = useCallback((u: Unit) => {
    setNotice(null);
    setSelected((s) => (s.includes(u.id) ? s.filter((id) => id !== u.id) : s.length >= 8 ? s : [...s, u.id]));
  }, []);

  // Units that became unavailable for the chosen dates drop out of the selection
  useEffect(() => {
    const lost = selected.filter((id) => unavailable.has(id));
    if (!lost.length) return;
    const names = (units ?? []).filter((u) => lost.includes(u.id)).map((u) => u.name);
    setSelected((s) => s.filter((id) => !unavailable.has(id)));
    setNotice(`${names.join(', ')} ${names.length === 1 ? 'is' : 'are'} already booked for those dates and ${names.length === 1 ? 'was' : 'were'} removed.`);
  }, [unavailable, selected, units]);

  // "Book Now" on an accommodation card (also one pressed while this widget was still downloading)
  useEffect(() => {
    if (!units) return;
    const open = (listing: string) => {
      const match = (units ?? []).filter((u) => u.listing === listing && u.is_active);
      if (!match.length) return;
      setResort(match[0].resort);
      setStep('choose');
      // Camping types cover several sites: show them in the list instead of picking one
      if (match.length === 1) setSelected((s) => (s.includes(match[0].id) ? s : [...s.filter((id) => (units ?? []).find((u) => u.id === id)?.resort === match[0].resort), match[0].id]));
      else setView('list');
      if (root.current) scrollToTarget(root.current);
    };
    const pending = takePendingBook();
    if (pending) open(pending);
    const onBook = (e: Event) => open((e as CustomEvent<string>).detail);
    window.addEventListener(BOOK_UNIT_EVENT, onBook);
    return () => window.removeEventListener(BOOK_UNIT_EVENT, onBook);
  }, [units]);

  // Entrance: this widget loads after the page-wide effects ran, so it brings its own
  useLayoutEffect(() => {
    if (!root.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const ctx = gsap.context(() => {
      const heading = root.current!.querySelector('.bw-head h2');
      if (heading) {
        const split = SplitText.create(heading, { type: 'words', mask: 'words' });
        gsap.from(split.words, { yPercent: 115, rotate: 6, duration: 1.1, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: heading, start: 'top 88%' } });
      }
      gsap.from('.bw-controls, .bw-choose > *', {
        y: 60,
        autoAlpha: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.12,
        scrollTrigger: { trigger: '.bw-controls', start: 'top 88%' },
      });
      // The site map builds itself: tracks draw, then the buildings pop up
      const map = root.current!.querySelector('.site-map');
      if (map) {
        gsap
          .timeline({ scrollTrigger: { trigger: map, start: 'top 80%' } })
          .fromTo(map.querySelectorAll('.sm-road'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.04 })
          .from(map.querySelectorAll('.sm-scenery'), { autoAlpha: 0, duration: 0.6, stagger: 0.004 }, 0.4)
          .from(map.querySelectorAll('.sm-pop'), { scale: 0, transformOrigin: '50% 100%', duration: 0.7, ease: 'back.out(2.2)', stagger: { each: 0.018, from: 'random' } }, 0.6);
      }
    }, root);
    ScrollTrigger.refresh();
    return () => ctx.revert();
    // Only on first appearance; the map element exists from the first render when units are cached
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(units)]);

  // Step transitions
  useLayoutEffect(() => {
    if (!stage.current) return;
    gsap.fromTo(stage.current, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' });
  }, [step, resort]);

  // Total counts up
  useEffect(() => {
    if (!totalRef.current) return;
    const o = { v: Number(totalRef.current.dataset.v ?? 0) };
    const tween = gsap.to(o, {
      v: total,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        if (totalRef.current) totalRef.current.textContent = formatRand(o.v);
      },
    });
    totalRef.current.dataset.v = String(total);
    return () => {
      tween.kill();
    };
  }, [total]);

  const switchResort = (r: ResortId) => {
    setResort(r);
    setSelected([]);
    setNotice(null);
    setView(r === 'paindane' ? 'map' : 'list');
  };

  const onCheckIn = (v: string) => {
    setCheckIn(v);
    if (!checkOut || checkOut <= v) setCheckOut(v ? addDays(v, 1) : '');
  };

  const summaryText = () =>
    [
      `Resort: ${RESORTS.find((r) => r.id === resort)?.name}`,
      `Check in: ${checkIn ? formatDate(checkIn) : '-'}`,
      `Check out: ${checkOut ? formatDate(checkOut) : '-'}`,
      `Nights: ${nights}`,
      `Adults: ${adults}, Children: ${children}`,
      `Units: ${selectedUnits.map((u) => u.name).join(', ')}`,
      `Estimated total: ${formatRand(total)}`,
    ].join('\n');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    const res = await requestBooking({ resort, unitIds: selected, checkIn, checkOut, adults, children, ...guest });
    setSending(false);
    if (res.ok) {
      setResult(res);
      setStep('done');
      return;
    }
    if (res.notConfigured) {
      setNotConfigured(true);
      return;
    }
    if (res.takenUnits?.length) {
      markTaken(res.takenUnits);
      setStep('choose');
    }
    setError(res.error);
  };

  const startOver = () => {
    setSelected([]);
    setResult(null);
    setNotConfigured(false);
    setError(null);
    setStep('choose');
  };

  const mailBody = encodeURIComponent(`${summaryText()}\n\nName: ${guest.name}\nEmail: ${guest.email}\nCellular: ${guest.phone}\n\n${guest.notes}`);
  const mailHref = `mailto:${contact.email}?subject=${encodeURIComponent('Booking Inquiry – Tan ‘n Biki')}&body=${mailBody}`;
  const waHref = (text: string) => `${contact.whatsapp}?text=${encodeURIComponent(text)}`;

  return (
    <div className="booking" ref={root}>
      <div className="bw-head">
        <span className="eyebrow">Book Your Stay</span>
        <h2 data-split>Choose your spot</h2>
        <p>
          Pick your dates, choose your unit or campsite on the map and send us your request. We hold it for you for 48 hours while
          we confirm.
        </p>
      </div>

      {step !== 'done' && (
        <div className="bw-controls">
          <div className="bw-resorts" role="tablist" aria-label="Resort">
            {RESORTS.map((r) => (
              <button key={r.id} role="tab" aria-selected={resort === r.id} className={`pill ${resort === r.id ? 'active' : ''}`} onClick={() => switchResort(r.id)}>
                {r.name}
              </button>
            ))}
          </div>
          <label className="bw-date">
            <span>Check in</span>
            <input type="date" min={today} value={checkIn} onChange={(e) => onCheckIn(e.target.value)} />
          </label>
          <label className="bw-date">
            <span>Check out</span>
            <input type="date" min={checkIn ? addDays(checkIn, 1) : addDays(today, 1)} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </label>
          <Stepper label="Adults" value={adults} min={1} onChange={setAdults} />
          <Stepper label="Children" value={children} min={0} onChange={setChildren} />
          <div className="bw-nights">
            <strong>{nights}</strong>
            <span>{nights === 1 ? 'night' : 'nights'}</span>
          </div>
        </div>
      )}

      <div ref={stage}>
        {step === 'choose' && (
          <div className="bw-choose">
            <div className="bw-main">
              <div className="bw-toolbar">
                {resort === 'paindane' ? (
                  <div className="bw-view" role="tablist" aria-label="View">
                    <button role="tab" aria-selected={view === 'map'} className={`chip ${view === 'map' ? 'active' : ''}`} onClick={() => setView('map')}>
                      Site map
                    </button>
                    <button role="tab" aria-selected={view === 'list'} className={`chip ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
                      List
                    </button>
                  </div>
                ) : (
                  <span className="bw-hint">Pleasure Bay site map coming soon – choose from the list.</span>
                )}
                <span className={`bw-status ${loading ? 'is-loading' : ''}`}>
                  {!ready ? 'Choose your dates to see what’s available' : loading ? 'Checking availability…' : `${resortUnits.filter((u) => stateOf(u) === 'free' || stateOf(u) === 'selected').length} available for your dates`}
                </span>
              </div>

              {!units ? (
                <div className="bw-loading">Loading…</div>
              ) : view === 'map' && resort === 'paindane' ? (
                <>
                  <MapExplorer
                    units={resortUnits}
                    stateOf={stateOf}
                    onToggle={toggle}
                    tooltip={(u) => {
                      const st = stateOf(u);
                      return (
                        <>
                          <span className="map-tip-cat" style={{ background: CATEGORIES[u.category]?.color }}>
                            {u.category}
                          </span>
                          <strong>{u.name}</strong>
                          {u.sleeps && <span>Sleeps {u.sleeps}</span>}
                          <span className="map-tip-price">
                            {st === 'inactive'
                              ? 'Contact us to book'
                              : ready
                                ? `${formatRand(stayPrice([u], checkIn, checkOut, peaks))} for ${nights} night${nights === 1 ? '' : 's'}`
                                : `${formatRand(u.rate_cents)} per night`}
                          </span>
                          <em className={`map-tip-state is-${st}`}>
                            {st === 'taken' ? 'Booked for your dates' : st === 'selected' ? 'Selected – tap to remove' : st === 'inactive' ? 'Not bookable online' : 'Tap to select'}
                          </em>
                        </>
                      );
                    }}
                  />
                  <ul className="map-legend">
                    {Object.entries(CATEGORIES)
                      .filter(([c]) => resortUnits.some((u) => u.category === c))
                      .map(([c, m]) => (
                        <li key={c}>
                          <span style={{ background: m.color }} /> {c}
                        </li>
                      ))}
                    <li>
                      <span className="lg-taken" /> Booked
                    </li>
                    <li>
                      <span className="lg-selected" /> Your choice
                    </li>
                  </ul>
                </>
              ) : (
                <UnitList units={resortUnits} stateOf={stateOf} onToggle={toggle} priceOf={(u) => (ready ? stayPrice([u], checkIn, checkOut, peaks) : null)} />
              )}
            </div>

            <div className="bw-bar" aria-live="polite">
              {(notice || error || (ready && !hasCampsites && sleeps > 0 && sleeps < adults + children && selectedUnits.length > 0)) && (
                <div className="bw-bar-msgs">
                  {notice && <p className="bw-notice">{notice}</p>}
                  {ready && !hasCampsites && sleeps > 0 && sleeps < adults + children && selectedUnits.length > 0 && (
                    <p className="bw-warn">
                      Your units sleep {sleeps}, and you are {adults + children}. Add another unit or let us know in your comments.
                    </p>
                  )}
                  {error && <p className="bw-error">{error}</p>}
                </div>
              )}
              <div className="bw-bar-row">
                <div className="bw-bar-stay">
                  <h3>Your stay</h3>
                  {selectedUnits.length === 0 ? (
                    <p className="bw-empty">Nothing selected yet – tap a unit on the map.</p>
                  ) : (
                    <ul className="bw-selected">
                      {selectedUnits.map((u) => (
                        <li key={u.id}>
                          <strong>{u.name}</strong>
                          <small>{ready ? formatRand(stayPrice([u], checkIn, checkOut, peaks)) : `${formatRand(u.rate_cents)} / night`}</small>
                          <button type="button" onClick={() => toggle(u)} aria-label={`Remove ${u.name}`}>
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="bw-total">
                  <span>{ready ? `${nights} ${nights === 1 ? 'night' : 'nights'} · estimated total` : 'Estimated total'}</span>
                  <span ref={totalRef} className="bw-total-amount">
                    {formatRand(total)}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-navy bw-continue"
                  disabled={!ready || selectedUnits.length === 0}
                  onClick={() => {
                    setError(null);
                    setStep('details');
                  }}
                >
                  {!ready ? 'Choose your dates' : selectedUnits.length === 0 ? 'Choose a unit' : 'Continue'}
                </button>
              </div>
              <p className="bw-small">Rates are per unit / site per night. Nothing is charged online; we confirm your booking with you.</p>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="bw-grid">
            <form className="bw-main booking-form" onSubmit={submit}>
              <h3>Your details</h3>
              <div className="grid-2">
                <input required maxLength={120} placeholder="Name and Surname *" aria-label="Name and Surname" value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} />
                <input required type="email" maxLength={160} placeholder="Your email address *" aria-label="Your email address" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} />
                <input required type="tel" maxLength={40} placeholder="Cellular *" aria-label="Cellular" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} />
              </div>
              <textarea rows={6} maxLength={2000} placeholder="Enter your comments here" aria-label="Comments" value={guest.notes} onChange={(e) => setGuest({ ...guest, notes: e.target.value })} />
              {error && <p className="bw-error">{error}</p>}
              {notConfigured && (
                <div className="bw-fallback">
                  <p>
                    <strong>Online booking isn’t switched on yet.</strong> Send us your request by email or WhatsApp instead – your
                    choices are already filled in.
                  </p>
                  <div className="bw-actions">
                    <a className="btn btn-navy" href={mailHref}>
                      Email request
                    </a>
                    <a className="btn btn-sand" href={waHref(`Hi, I'd like to book:\n${summaryText()}\nName: ${guest.name}`)} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                  </div>
                </div>
              )}
              <div className="form-foot">
                <button type="button" className="btn-link" onClick={() => setStep('choose')}>
                  ← Back to the map
                </button>
                <button type="submit" className="btn btn-navy" disabled={sending}>
                  {sending ? 'Sending…' : 'Send booking request'}
                </button>
              </div>
            </form>
            <aside className="bw-panel">
              <div className="bw-summary">
                <h3>Your stay</h3>
                <dl className="bw-dl">
                  <dt>Resort</dt>
                  <dd>{RESORTS.find((r) => r.id === resort)?.name}</dd>
                  <dt>Check in</dt>
                  <dd>{formatDate(checkIn)}</dd>
                  <dt>Check out</dt>
                  <dd>{formatDate(checkOut)}</dd>
                  <dt>Guests</dt>
                  <dd>
                    {adults} adult{adults === 1 ? '' : 's'}
                    {children ? `, ${children} child${children === 1 ? '' : 'ren'}` : ''}
                  </dd>
                  <dt>Units</dt>
                  <dd>{selectedUnits.map((u) => u.name).join(', ')}</dd>
                </dl>
                <div className="bw-total">
                  <span>
                    {nights} {nights === 1 ? 'night' : 'nights'} · estimated total
                  </span>
                  <span className="bw-total-amount">{formatRand(total)}</span>
                </div>
              </div>
            </aside>
          </div>
        )}

        {step === 'done' && result && (
          <div className="bw-done">
            <div className="bw-tick" aria-hidden="true">
              ✓
            </div>
            <span className="eyebrow">Request received</span>
            <h3>Thank you, {guest.name.split(' ')[0]}!</h3>
            <p>
              Your booking reference is <strong className="bw-ref">{result.ref}</strong>. We’re holding{' '}
              <strong>{selectedUnits.map((u) => u.name).join(', ')}</strong> from <strong>{formatDate(checkIn)}</strong> to{' '}
              <strong>{formatDate(checkOut)}</strong> for 48 hours while we confirm your booking with you.
            </p>
            <p>
              Estimated total: <strong>{formatRand(result.amountCents)}</strong>
            </p>
            <div className="bw-actions">
              <a className="btn btn-sand" href={waHref(`Hi, I've just sent booking request ${result.ref} on your website.`)} target="_blank" rel="noreferrer">
                WhatsApp us your reference
              </a>
              <button type="button" className="btn btn-navy" onClick={startOver}>
                Make another booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

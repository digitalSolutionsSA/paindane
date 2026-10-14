import { useCallback, useEffect, useState } from 'react';
import { formatDate, formatRand, nightsBetween } from '../booking/dates';
import { useUnitsAndRates } from '../booking/hooks';
import { RESORTS } from '../booking/units';
import { StatusBadge } from './Bookings';
import {
  cancelBooking,
  confirmBooking,
  getBooking,
  holdExpired,
  markPaid,
  setCheckedIn,
  sourceLabels,
  updateDetails,
  whatsappLink,
  type Booking,
} from './admin';

interface Props {
  id: string;
  onClose: () => void;
  onChanged: () => void;
}

/** One booking with everything staff can do to it */
export default function BookingDetail({ id, onClose, onChanged }: Props) {
  const { units } = useUnitsAndRates();
  const [b, setB] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await getBooking(id);
      setB(data);
      setNotes(data.staff_notes ?? '');
      setAmount(String(Math.round(data.amount_cents / 100)));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const run = async (action: () => Promise<unknown>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setError(null);
    try {
      await action();
      await load();
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const unitNames = (b?.unit_ids ?? []).map((uid) => units?.find((u) => u.id === uid)?.name ?? uid);
  const live = b && (b.status === 'confirmed' || b.status === 'paid');
  const dirty = b && (notes !== (b.staff_notes ?? '') || amount !== String(Math.round(b.amount_cents / 100)));

  return (
    <div className="pt-modal" onClick={onClose} role="dialog" aria-modal="true" aria-label="Booking">
      <div className="pt-drawer" onClick={(e) => e.stopPropagation()}>
        <button className="pt-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        {!b ? (
          <p className="pt-muted">{error ?? 'Loading…'}</p>
        ) : (
          <>
            <div className="pt-drawer-head">
              <span className="pt-ref">{b.ref}</span>
              <StatusBadge b={b} />
            </div>
            <h2>{b.name}</h2>
            {holdExpired(b) && (
              <p className="pt-warn">
                This request’s 48-hour hold has run out, so its units are free for others again. Confirming will work if nobody has booked
                them since.
              </p>
            )}

            <dl className="pt-dl">
              <dt>Resort</dt>
              <dd>{RESORTS.find((r) => r.id === b.resort)?.name}</dd>
              <dt>Check in</dt>
              <dd>{formatDate(b.check_in)}</dd>
              <dt>Check out</dt>
              <dd>
                {formatDate(b.check_out)} ({nightsBetween(b.check_in, b.check_out)} nights)
              </dd>
              <dt>Units</dt>
              <dd>{unitNames.join(', ')}</dd>
              <dt>Guests</dt>
              <dd>
                {b.adults} adult{b.adults === 1 ? '' : 's'}
                {b.children ? `, ${b.children} child${b.children === 1 ? '' : 'ren'}` : ''}
              </dd>
              <dt>Source</dt>
              <dd>{sourceLabels[b.source]}</dd>
              <dt>Received</dt>
              <dd>{new Date(b.created_at).toLocaleString('en-ZA')}</dd>
              {b.checked_in_at && (
                <>
                  <dt>Checked in</dt>
                  <dd>{new Date(b.checked_in_at).toLocaleString('en-ZA')}</dd>
                </>
              )}
            </dl>

            <div className="pt-contact">
              {b.phone && (
                <>
                  <a className="pt-btn pt-btn-ghost" href={`tel:${b.phone}`}>
                    Call {b.phone}
                  </a>
                  <a
                    className="pt-btn pt-btn-ghost"
                    href={`${whatsappLink(b.phone)}?text=${encodeURIComponent(`Hi ${b.name.split(' ')[0]}, this is Tan ‘n Biki about your booking ${b.ref}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp
                  </a>
                </>
              )}
              {b.email && (
                <a className="pt-btn pt-btn-ghost" href={`mailto:${b.email}?subject=${encodeURIComponent(`Your Tan ‘n Biki booking ${b.ref}`)}`}>
                  Email
                </a>
              )}
            </div>

            {b.guest_notes && (
              <div className="pt-note">
                <span>Guest’s comments</span>
                <p>{b.guest_notes}</p>
              </div>
            )}

            <div className="pt-edit">
              <label className="pt-field">
                <span>Amount due (R)</span>
                <input type="number" min={0} step={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
              </label>
              <label className="pt-field">
                <span>Staff notes</span>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Only staff can see these" />
              </label>
              {dirty && (
                <button
                  className="pt-btn pt-btn-primary"
                  disabled={busy}
                  onClick={() => run(() => updateDetails(b.id, notes, amount === '' ? null : Math.round(Number(amount) * 100)))}
                >
                  Save changes
                </button>
              )}
            </div>

            {error && <p className="pt-error">{error}</p>}

            <div className="pt-actions">
              {b.status === 'pending' && (
                <>
                  <button className="pt-btn pt-btn-primary" disabled={busy} onClick={() => run(() => confirmBooking(b.id))}>
                    Confirm booking
                  </button>
                  <button className="pt-btn pt-btn-green" disabled={busy} onClick={() => run(() => markPaid(b.id))}>
                    Confirm & mark paid
                  </button>
                  <button
                    className="pt-btn pt-btn-danger"
                    disabled={busy}
                    onClick={() => run(() => cancelBooking(b.id, 'declined'), 'Decline this request? Its units become free again.')}
                  >
                    Decline
                  </button>
                </>
              )}
              {b.status === 'confirmed' && (
                <button className="pt-btn pt-btn-green" disabled={busy} onClick={() => run(() => markPaid(b.id))}>
                  Mark paid
                </button>
              )}
              {live && (
                <>
                  <button className="pt-btn pt-btn-primary" disabled={busy} onClick={() => run(() => setCheckedIn(b.id, !b.checked_in_at))}>
                    {b.checked_in_at ? 'Undo check-in' : 'Check in'}
                  </button>
                  <button
                    className="pt-btn pt-btn-danger"
                    disabled={busy}
                    onClick={() => run(() => cancelBooking(b.id, 'cancelled'), 'Cancel this booking? Its units become free again. Refund any payment separately.')}
                  >
                    Cancel booking
                  </button>
                </>
              )}
            </div>
            <p className="pt-muted pt-small">
              Amount due: {formatRand(b.amount_cents)}. Payments are only recorded here; take and refund money outside the portal.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

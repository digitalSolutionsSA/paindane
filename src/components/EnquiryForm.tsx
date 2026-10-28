import { useState, type FormEvent } from 'react';
import { contact, enquiryForm } from '../content';
import DateRangePicker from './DateRangePicker';
import { WhatsApp } from './Icons';

type Status = { state: 'idle' } | { state: 'sending' } | { state: 'sent' } | { state: 'error'; message: string };

/**
 * Booking enquiry form. Posts to /api/enquiry (a Netlify Function), which emails the details to
 * Tan 'n Biki management through Resend. Nothing is booked or paid here – management confirms first.
 */
export default function EnquiryForm() {
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const [dates, setDates] = useState({ arrival: '', departure: '' });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // The calendar's fields are custom, so the browser can't require them – check here instead
    if (!dates.arrival || !dates.departure) {
      setStatus({ state: 'error', message: 'Please choose your arrival and departure dates.' });
      return;
    }
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus({ state: 'sending' });
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error || 'Something went wrong.');
      setStatus({ state: 'sent' });
      form.reset();
      setDates({ arrival: '', departure: '' });
    } catch (err) {
      setStatus({ state: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' });
    }
  };

  if (status.state === 'sent') {
    return (
      <div id="enquire" className="booking-form enquiry-done sr-up" role="status">
        <span className="enquiry-done-icon" aria-hidden="true">✓</span>
        <h3>{enquiryForm.sentTitle}</h3>
        <p>{enquiryForm.sentText}</p>
        <button type="button" className="btn btn-navy" onClick={() => setStatus({ state: 'idle' })}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form id="enquire" className="booking-form enquiry-form sr-up" onSubmit={submit} noValidate={false}>
      <div className="enquiry-form-head">
        <span className="eyebrow">{enquiryForm.eyebrow}</span>
        <h2>{enquiryForm.title}</h2>
        <p>{enquiryForm.intro}</p>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Full name *</span>
          <input name="name" required minLength={2} autoComplete="name" />
        </label>
        <label className="field">
          <span>Email *</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
      </div>
      <div className="grid-2">
        <label className="field">
          <span>Phone / WhatsApp *</span>
          <input name="phone" type="tel" required autoComplete="tel" />
        </label>
        <label className="field">
          <span>Resort *</span>
          <select name="resort" required defaultValue="">
            <option value="" disabled>
              Choose a resort
            </option>
            {enquiryForm.resorts.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
      </div>
      <DateRangePicker
        arrival={dates.arrival}
        departure={dates.departure}
        onChange={(arrival, departure) => setDates({ arrival, departure })}
      />
      <div className="grid-3">
        <label className="field">
          <span>Adults *</span>
          <input name="adults" type="number" required min={1} max={60} defaultValue={2} />
        </label>
        <label className="field">
          <span>Children</span>
          <input name="children" type="number" min={0} max={60} defaultValue={0} />
        </label>
        <label className="field">
          <span>Accommodation</span>
          <select name="accommodation" defaultValue="">
            <option value="">Not sure yet</option>
            {enquiryForm.accommodation.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span>Anything else we should know?</span>
        <textarea name="message" rows={4} maxLength={3000} placeholder={enquiryForm.messagePlaceholder} />
      </label>

      {/* Honeypot – hidden from people, filled in by spam bots */}
      <label className="hp" aria-hidden="true">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>

      {status.state === 'error' && (
        <p className="enquiry-error" role="alert">
          {status.message} You can also{' '}
          <a href={contact.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp us
          </a>{' '}
          or email <a href={`mailto:${contact.email}`}>{contact.email}</a>.
        </p>
      )}

      <div className="form-foot">
        <span>{enquiryForm.note}</span>
        <button type="submit" className="btn btn-sand" disabled={status.state === 'sending'}>
          {status.state === 'sending' ? 'Sending…' : 'Send enquiry'}
        </button>
      </div>
      <a className="enquiry-wa" href={contact.whatsapp} target="_blank" rel="noreferrer">
        <WhatsApp width={16} height={16} /> Prefer WhatsApp? Chat to us on {contact.phone}
      </a>
    </form>
  );
}

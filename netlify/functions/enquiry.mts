// Booking enquiries from the website: validates the form and emails it to Tan 'n Biki management via Resend.
// The Resend API key lives only here (a Netlify environment variable), never in the browser.
//
// Netlify environment variables:
//   RESEND_API_KEY   required – from resend.com (API Keys)
//   ENQUIRY_TO       optional – where enquiries go (default tannbiki@paindane.com; comma-separate for several)
//   ENQUIRY_FROM     optional – sender, must be on the domain verified in Resend
//                    (default "Tan 'n Biki Website <enquiries@paindane.com>")

const DEFAULT_TO = 'tannbiki@paindane.com';
const DEFAULT_FROM = "Tan 'n Biki Website <enquiries@paindane.com>";

const RESORTS = ['Paindane Beach Resort', 'Pleasure Bay Resort', 'Either / not sure'];

type Enquiry = {
  name: string;
  email: string;
  phone: string;
  resort: string;
  accommodation: string;
  arrival: string;
  departure: string;
  adults: number;
  children: number;
  message: string;
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const nice = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Checks the submitted form; returns the clean enquiry or the first problem found. */
export function validate(body: Record<string, unknown>): { ok: true; enquiry: Enquiry } | { ok: false; error: string } {
  const e: Enquiry = {
    name: str(body.name, 120),
    email: str(body.email, 200),
    phone: str(body.phone, 40),
    resort: str(body.resort, 60),
    accommodation: str(body.accommodation, 80),
    arrival: str(body.arrival, 10),
    departure: str(body.departure, 10),
    adults: Number(body.adults),
    children: Number(body.children ?? 0),
    message: str(body.message, 3000),
  };
  if (e.name.length < 2) return { ok: false, error: 'Please enter your name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.email)) return { ok: false, error: 'Please enter a valid email address.' };
  if (e.phone.replace(/\D/g, '').length < 9) return { ok: false, error: 'Please enter a phone number we can reach you on.' };
  if (!RESORTS.includes(e.resort)) return { ok: false, error: 'Please choose a resort.' };
  if (!isDate(e.arrival) || !isDate(e.departure)) return { ok: false, error: 'Please choose your arrival and departure dates.' };
  if (e.departure <= e.arrival) return { ok: false, error: 'Departure must be after arrival.' };
  if (!Number.isInteger(e.adults) || e.adults < 1 || e.adults > 60) return { ok: false, error: 'Please enter the number of adults.' };
  if (!Number.isInteger(e.children) || e.children < 0 || e.children > 60) return { ok: false, error: 'Please check the number of children.' };
  return { ok: true, enquiry: e };
}

/** The email management receives: a table of the details, plus a plain-text version. */
export function buildEmail(e: Enquiry) {
  const nights = Math.round((Date.parse(e.departure) - Date.parse(e.arrival)) / 86_400_000);
  const rows: [string, string][] = [
    ['Name', e.name],
    ['Email', e.email],
    ['Phone', e.phone],
    ['Resort', e.resort],
    ['Accommodation', e.accommodation || 'Not specified'],
    ['Arrival', nice(e.arrival)],
    ['Departure', nice(e.departure)],
    ['Nights', String(nights)],
    ['Guests', `${e.adults} adult${e.adults === 1 ? '' : 's'}${e.children ? `, ${e.children} child${e.children === 1 ? '' : 'ren'}` : ''}`],
  ];
  const subject = `Booking enquiry: ${e.name} – ${e.resort} – ${nice(e.arrival)} (${nights} night${nights === 1 ? '' : 's'})`;
  const html = `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#0f2a3d">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#06395a;color:#fff;padding:20px 24px;border-radius:14px 14px 0 0">
    <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ffc21a">New booking enquiry</div>
    <div style="font-size:22px;font-weight:bold;margin-top:6px">${escape(e.name)}</div>
  </div>
  <div style="background:#fff;padding:20px 24px;border-radius:0 0 14px 14px">
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 0;color:#47606f;width:140px;vertical-align:top">${k}</td><td style="padding:8px 0;font-weight:bold">${escape(v)}</td></tr>`,
        )
        .join('')}
    </table>
    ${e.message ? `<div style="margin-top:16px;padding:14px 16px;background:#fff7e6;border-radius:10px;white-space:pre-wrap;font-size:15px">${escape(e.message)}</div>` : ''}
    <p style="margin:20px 0 0;font-size:13px;color:#47606f">Reply to this email to answer ${escape(e.name)} directly. The guest has been told that nothing is booked or paid until management confirms.</p>
  </div>
</div></body></html>`;
  const text = [
    'New booking enquiry from the Tan ‘n Biki website',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    ...(e.message ? ['', 'Message:', e.message] : []),
    '',
    `Reply to this email to answer ${e.name} directly.`,
  ].join('\n');
  return { subject, html, text };
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid request.' });
  }

  // Honeypot: real visitors never see or fill this field, bots do. Pretend it worked.
  if (str(body.company, 200)) return json(200, { ok: true });

  const result = validate(body);
  if (!result.ok) return json(400, { error: result.error });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('enquiry: RESEND_API_KEY is not set');
    return json(503, { error: 'Enquiries are not set up yet.' });
  }

  const { subject, html, text } = buildEmail(result.enquiry);
  const to = (process.env.ENQUIRY_TO || DEFAULT_TO).split(',').map((s) => s.trim()).filter(Boolean);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.ENQUIRY_FROM || DEFAULT_FROM,
      to,
      reply_to: result.enquiry.email,
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    console.error('enquiry: Resend error', res.status, await res.text());
    return json(502, { error: 'We couldn’t send your enquiry just now.' });
  }
  return json(200, { ok: true });
};

export const config = { path: '/api/enquiry' };

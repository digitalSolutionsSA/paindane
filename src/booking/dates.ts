// Stays are handled as plain 'YYYY-MM-DD' strings so time zones never shift a date.

const ms = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));

export const toIso = (t: number) => new Date(t).toISOString().slice(0, 10);

/** Today at the resort (Mozambique time) */
export const resortToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Maputo' }).format(new Date());

export const addDays = (iso: string, n: number) => toIso(ms(iso) + n * 86_400_000);

export const nightsBetween = (checkIn: string, checkOut: string) =>
  checkIn && checkOut ? Math.max(0, Math.round((ms(checkOut) - ms(checkIn)) / 86_400_000)) : 0;

/** Every night of a stay (check-in up to the night before check-out) */
export const stayNights = (checkIn: string, checkOut: string) =>
  Array.from({ length: nightsBetween(checkIn, checkOut) }, (_, i) => addDays(checkIn, i));

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-ZA', { timeZone: 'UTC', ...opts }).format(new Date(ms(iso)));

export const formatDate = (iso: string) => fmt(iso, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
export const formatShortDate = (iso: string) => fmt(iso, { day: 'numeric', month: 'short' });
export const formatMonth = (iso: string) => fmt(iso, { month: 'long', year: 'numeric' });
export const weekdayShort = (iso: string) => fmt(iso, { weekday: 'narrow' });

export const formatRand = (cents: number) =>
  'R' + new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 }).format(Math.round(cents / 100)).replace(/ /g, ' ');

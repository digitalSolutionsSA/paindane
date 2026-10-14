import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { UNITS, type MapSpot, type ResortId } from './units';
import { stayNights } from './dates';

export interface Unit {
  id: string;
  resort: ResortId;
  category: string;
  name: string;
  sleeps: number | null;
  description: string;
  rate_cents: number;
  peak_rate_cents: number | null;
  is_active: boolean;
  sort: number;
  listing?: string;
  map?: MapSpot;
}

export interface PeakPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

const seedUnits = (): Unit[] =>
  UNITS.map((u, i) => ({
    id: u.id,
    resort: u.resort,
    category: u.category,
    name: u.name,
    sleeps: u.sleeps,
    description: u.description,
    rate_cents: u.rate * 100,
    peak_rate_cents: null,
    is_active: u.active !== false,
    sort: (i + 1) * 10,
    listing: u.listing,
    map: u.map,
  }));

const layoutById = new Map(UNITS.map((u) => [u.id, u]));

/** Units with live rates from the database, merged with their map spots. Falls back to the local list. */
export async function fetchUnits(): Promise<Unit[]> {
  if (!supabase) return seedUnits();
  const { data, error } = await supabase.from('units').select('*').order('sort');
  if (error || !data?.length) return seedUnits();
  return (data as Unit[]).map((u) => ({ ...u, listing: layoutById.get(u.id)?.listing, map: layoutById.get(u.id)?.map }));
}

export async function fetchPeakPeriods(): Promise<PeakPeriod[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('peak_periods').select('*').order('start_date');
  if (error) return [];
  return data as PeakPeriod[];
}

/** Units that are booked or held on any night of the stay */
export async function fetchUnavailable(checkIn: string, checkOut: string): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('get_unavailable_units', { p_check_in: checkIn, p_check_out: checkOut });
  if (error) throw error;
  return (data ?? []) as string[];
}

/** Same rule as stay_price_cents in the database (the database price is the one that counts) */
export function stayPrice(units: Unit[], checkIn: string, checkOut: string, peaks: PeakPeriod[]) {
  const nights = stayNights(checkIn, checkOut);
  const isPeak = (night: string) => peaks.some((p) => night >= p.start_date && night <= p.end_date);
  return units.reduce(
    (sum, u) => sum + nights.reduce((s, n) => s + (isPeak(n) ? (u.peak_rate_cents ?? u.rate_cents) : u.rate_cents), 0),
    0,
  );
}

export interface BookingRequest {
  resort: ResortId;
  unitIds: string[];
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export type RequestResult =
  | { ok: true; ref: string; amountCents: number; holdExpiresAt: string }
  | { ok: false; error: string; takenUnits?: string[]; notConfigured?: boolean };

/** Sends the guest's booking request; the units are held for 48 hours while staff confirm */
export async function requestBooking(r: BookingRequest): Promise<RequestResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, notConfigured: true, error: 'Online booking is not connected yet.' };
  }
  const { data, error } = await supabase.rpc('request_booking', {
    p_resort: r.resort,
    p_unit_ids: r.unitIds,
    p_check_in: r.checkIn,
    p_check_out: r.checkOut,
    p_adults: r.adults,
    p_children: r.children,
    p_name: r.name,
    p_email: r.email,
    p_phone: r.phone,
    p_notes: r.notes,
  });
  if (error) {
    const taken = error.details && /just booked/.test(error.message) ? error.details.split(',') : undefined;
    return { ok: false, error: error.message || 'Something went wrong. Please try again.', takenUnits: taken };
  }
  const res = data as { ref: string; amount_cents: number; hold_expires_at: string };
  return { ok: true, ref: res.ref, amountCents: res.amount_cents, holdExpiresAt: res.hold_expires_at };
}

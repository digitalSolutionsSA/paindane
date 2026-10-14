import { supabase } from '../lib/supabase';
import type { ResortId } from '../booking/units';

export type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'cancelled' | 'declined';
export type BookingSource = 'online' | 'phone' | 'whatsapp' | 'email' | 'walk-in' | 'other';

export interface Booking {
  id: string;
  ref: string;
  resort: ResortId;
  check_in: string;
  check_out: string;
  unit_ids: string[];
  adults: number;
  children: number;
  name: string;
  email: string | null;
  phone: string | null;
  guest_notes: string | null;
  staff_notes: string | null;
  amount_cents: number;
  status: BookingStatus;
  source: BookingSource;
  hold_expires_at: string | null;
  checked_in_at: string | null;
  created_at: string;
}

export interface NightRow {
  unit_id: string;
  night: string;
  status: 'held' | 'booked';
  expires_at: string | null;
  booking: Pick<Booking, 'id' | 'ref' | 'name' | 'status' | 'checked_in_at'> | null;
}

export const sourceLabels: Record<BookingSource, string> = {
  online: 'Website',
  phone: 'Phone',
  whatsapp: 'WhatsApp',
  email: 'Email',
  'walk-in': 'Walk-in',
  other: 'Other',
};

export const statusLabels: Record<BookingStatus, string> = {
  pending: 'Request',
  confirmed: 'Confirmed',
  paid: 'Paid',
  cancelled: 'Cancelled',
  declined: 'Declined',
};

const db = () => {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
};

/** Throws the database's message so the portal can show it as-is */
const unwrap = <T>({ data, error }: { data: T; error: { message: string } | null }) => {
  if (error) throw new Error(error.message);
  return data;
};

export const holdExpired = (b: Booking) => b.status === 'pending' && !!b.hold_expires_at && new Date(b.hold_expires_at) < new Date();

export async function listBookings(): Promise<Booking[]> {
  return unwrap(await db().from('bookings').select('*').order('check_in', { ascending: true }).limit(2000)) as Booking[];
}

export async function getBooking(id: string): Promise<Booking> {
  return unwrap(await db().from('bookings').select('*').eq('id', id).single()) as Booking;
}

export async function listNights(from: string, to: string): Promise<NightRow[]> {
  return unwrap(
    await db()
      .from('unit_nights')
      .select('unit_id, night, status, expires_at, booking:bookings(id, ref, name, status, checked_in_at)')
      .gte('night', from)
      .lte('night', to),
  ) as unknown as NightRow[];
}

const rpc = async (fn: string, args: Record<string, unknown>) => unwrap(await db().rpc(fn, args));

export const confirmBooking = (id: string) => rpc('confirm_booking', { p_booking_id: id });
export const markPaid = (id: string) => rpc('mark_booking_paid', { p_booking_id: id });
export const cancelBooking = (id: string, status: 'cancelled' | 'declined') => rpc('cancel_booking', { p_booking_id: id, p_status: status });
export const setCheckedIn = (id: string, on: boolean) => rpc('set_checked_in', { p_booking_id: id, p_checked_in: on });
export const updateDetails = (id: string, notes: string, amountCents: number | null) =>
  rpc('update_booking_details', { p_booking_id: id, p_staff_notes: notes, p_amount_cents: amountCents });

export interface ManualBooking {
  resort: ResortId;
  unitIds: string[];
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  name: string;
  email: string;
  phone: string;
  source: BookingSource;
  paid: boolean;
  amountCents: number | null;
  notes: string;
}

export const createManualBooking = (b: ManualBooking) =>
  rpc('staff_create_booking', {
    p_resort: b.resort,
    p_unit_ids: b.unitIds,
    p_check_in: b.checkIn,
    p_check_out: b.checkOut,
    p_adults: b.adults,
    p_children: b.children,
    p_name: b.name,
    p_email: b.email,
    p_phone: b.phone,
    p_source: b.source,
    p_paid: b.paid,
    p_amount_cents: b.amountCents,
    p_notes: b.notes,
  }) as Promise<string>;

export async function updateUnit(id: string, patch: { rate_cents?: number; peak_rate_cents?: number | null; is_active?: boolean }) {
  unwrap(await db().from('units').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id));
}

export async function addPeakPeriod(name: string, start: string, end: string) {
  unwrap(await db().from('peak_periods').insert({ name, start_date: start, end_date: end }));
}

export async function deletePeakPeriod(id: string) {
  unwrap(await db().from('peak_periods').delete().eq('id', id));
}

/** WhatsApp link for a guest's number (South African numbers starting with 0 get +27) */
export const whatsappLink = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits.startsWith('0') ? '27' + digits.slice(1) : digits}`;
};

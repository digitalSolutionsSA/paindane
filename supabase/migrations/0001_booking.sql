-- Tan 'n Biki booking system: units, rates, booking requests, staff portal.
--
-- Guests book units / campsites for a range of nights. A unit can never be double booked:
-- unit_nights has one row per (unit, night), enforced by its primary key. A guest's online request
-- holds the nights for 48 hours; staff then confirm it (the hold becomes a booking) or decline it.
-- Expired holds are cleared whenever someone else asks for the same nights.
--
-- Online payment (Yoco) is not wired up yet: the payment_* columns on bookings are reserved for it.

-- ── Staff ────────────────────────────────────────────────────────────────────
-- Staff accounts are created in Supabase Auth (Authentication → Users → Add user). Signing in only
-- gives access to the portal once the account also has a row in `staff`:
--   insert into staff (user_id, email) select id, email from auth.users where email = 'someone@example.com';

create table if not exists staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz not null default now()
);

alter table staff enable row level security;

create or replace function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from staff where user_id = auth.uid());
$$;

revoke execute on function is_staff() from public;
grant execute on function is_staff() to anon, authenticated, service_role;

create policy "Staff can see staff" on staff
  for select to authenticated using (is_staff());

-- ── Units & rates ────────────────────────────────────────────────────────────

create table if not exists units (
  id text primary key,
  resort text not null check (resort in ('paindane', 'pleasure-bay')),
  category text not null,
  name text not null,
  sleeps integer,
  description text not null default '',
  -- Price per night, and the price per night during peak periods (null = same as normal)
  rate_cents integer not null default 0 check (rate_cents >= 0),
  peak_rate_cents integer check (peak_rate_cents >= 0),
  is_active boolean not null default true,
  sort integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table units enable row level security;

create policy "Public can view units" on units
  for select using (true);
create policy "Staff can edit units" on units
  for update to authenticated using (is_staff()) with check (is_staff());

-- Nights from start_date to end_date (both included) are charged at peak rates
create table if not exists peak_periods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

alter table peak_periods enable row level security;

create policy "Public can view peak periods" on peak_periods
  for select using (true);
create policy "Staff can add peak periods" on peak_periods
  for insert to authenticated with check (is_staff());
create policy "Staff can edit peak periods" on peak_periods
  for update to authenticated using (is_staff()) with check (is_staff());
create policy "Staff can delete peak periods" on peak_periods
  for delete to authenticated using (is_staff());

-- ── Bookings ─────────────────────────────────────────────────────────────────

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,
  resort text not null check (resort in ('paindane', 'pleasure-bay')),
  check_in date not null,
  check_out date not null,
  unit_ids text[] not null,
  adults integer not null default 1 check (adults >= 0),
  children integer not null default 0 check (children >= 0),
  name text not null,
  email text,
  phone text,
  guest_notes text,
  staff_notes text,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'ZAR',
  -- pending = guest request waiting for staff; confirmed = accepted, not paid yet; paid = settled
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'paid', 'cancelled', 'declined')),
  source text not null default 'online'
    check (source in ('online', 'phone', 'whatsapp', 'email', 'walk-in', 'other')),
  -- When an online request's hold on its nights runs out (null once confirmed)
  hold_expires_at timestamptz,
  checked_in_at timestamptz,
  checked_in_by uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  -- Reserved for online payments (Yoco) later
  payment_provider text,
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in)
);

create index if not exists bookings_status_idx on bookings(status);
create index if not exists bookings_check_in_idx on bookings(check_in);

-- Written only through the functions below
alter table bookings enable row level security;

create policy "Staff can view bookings" on bookings
  for select to authenticated using (is_staff());

create table if not exists unit_nights (
  unit_id text not null references units(id),
  night date not null,
  booking_id uuid not null references bookings(id) on delete cascade,
  status text not null check (status in ('held', 'booked')),
  -- Only for holds: after this the night is free again
  expires_at timestamptz,
  primary key (unit_id, night)
);

create index if not exists unit_nights_booking_id_idx on unit_nights(booking_id);
create index if not exists unit_nights_night_idx on unit_nights(night);

alter table unit_nights enable row level security;

create policy "Staff can view unit nights" on unit_nights
  for select to authenticated using (is_staff());

-- ── Helpers ──────────────────────────────────────────────────────────────────

-- Today at the resort
create or replace function resort_today()
returns date
language sql
stable
as $$
  select (now() at time zone 'Africa/Maputo')::date;
$$;

-- Price of a stay: each unit's nightly rate for every night, peak rate on peak nights
create or replace function stay_price_cents(p_unit_ids text[], p_check_in date, p_check_out date)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(
    case
      when exists (select 1 from peak_periods p where n.night between p.start_date and p.end_date)
        then coalesce(u.peak_rate_cents, u.rate_cents)
      else u.rate_cents
    end
  ), 0)::integer
  from units u
  cross join lateral (
    select d::date as night from generate_series(p_check_in, p_check_out - 1, interval '1 day') d
  ) n
  where u.id = any(p_unit_ids);
$$;

-- Units that are booked, or held by an unexpired request, on any night of the stay
create or replace function get_unavailable_units(p_check_in date, p_check_out date)
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select distinct unit_id from unit_nights
  where night >= p_check_in and night < p_check_out
    and (status = 'booked' or expires_at > now());
$$;

create or replace function new_booking_ref()
returns text
language plpgsql
set search_path = public
as $$
declare
  v_ref text;
begin
  loop
    v_ref := 'TB' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    exit when not exists (select 1 from bookings where ref = v_ref);
  end loop;
  return v_ref;
end;
$$;

-- Validates a stay. Raises a readable message when something is wrong.
create or replace function check_stay(p_resort text, p_unit_ids text[], p_check_in date, p_check_out date, p_online boolean)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_bad text[];
begin
  if coalesce(array_length(p_unit_ids, 1), 0) = 0 then
    raise exception 'Please choose at least one unit or campsite.';
  end if;
  if p_check_in is null or p_check_out is null or p_check_out <= p_check_in then
    raise exception 'Please choose your check-in and check-out dates.';
  end if;
  if p_online then
    if array_length(p_unit_ids, 1) > 8 then
      raise exception 'You can request up to 8 units at a time. Please contact us for larger groups.';
    end if;
    if p_check_in < resort_today() then
      raise exception 'Check-in can''t be in the past.';
    end if;
    if p_check_out - p_check_in > 30 then
      raise exception 'Online requests are limited to 30 nights. Please contact us for longer stays.';
    end if;
    if p_check_in > resort_today() + 730 then
      raise exception 'We take bookings up to two years ahead.';
    end if;
  end if;

  select array_agg(u) into v_bad from unnest(p_unit_ids) u
  where not exists (
    select 1 from units x where x.id = u and x.resort = p_resort and (x.is_active or not p_online)
  );
  if v_bad is not null then
    raise exception 'These units can''t be booked: %', array_to_string(v_bad, ', ');
  end if;
end;
$$;

-- Puts the booking's units on its nights. Returns the units someone else already has (empty = done).
create or replace function claim_unit_nights(p_booking_id uuid, p_status text, p_expires_at timestamptz)
returns text[]
language plpgsql
set search_path = public
as $$
declare
  b bookings;
  v_taken text[];
begin
  select * into b from bookings where id = p_booking_id;
  if not found then
    raise exception 'Booking % not found', p_booking_id;
  end if;

  -- One availability-changing transaction at a time
  perform pg_advisory_xact_lock(hashtext('unit_nights'));

  delete from unit_nights r
  where r.unit_id = any(b.unit_ids) and r.night >= b.check_in and r.night < b.check_out
    and r.booking_id <> b.id and r.status = 'held' and r.expires_at < now();

  select array_agg(distinct r.unit_id) into v_taken
  from unit_nights r
  where r.unit_id = any(b.unit_ids) and r.night >= b.check_in and r.night < b.check_out
    and r.booking_id <> b.id;
  if v_taken is not null then
    return v_taken;
  end if;

  -- Drop nights this booking no longer covers (after its dates or units changed)
  delete from unit_nights r
  where r.booking_id = b.id
    and not (r.unit_id = any(b.unit_ids) and r.night >= b.check_in and r.night < b.check_out);

  insert into unit_nights (unit_id, night, booking_id, status, expires_at)
  select u, d::date, b.id, p_status, p_expires_at
  from unnest(b.unit_ids) u
  cross join generate_series(b.check_in, b.check_out - 1, interval '1 day') d
  on conflict (unit_id, night) do update set status = excluded.status, expires_at = excluded.expires_at
    where unit_nights.booking_id = excluded.booking_id;

  return '{}';
end;
$$;

revoke execute on function new_booking_ref() from public, anon, authenticated;
revoke execute on function check_stay(text, text[], date, date, boolean) from public, anon, authenticated;
revoke execute on function claim_unit_nights(uuid, text, timestamptz) from public, anon, authenticated;

-- ── Guest request (public) ───────────────────────────────────────────────────

-- Called from the website. Holds the units for 48 hours and returns the booking reference.
create or replace function request_booking(
  p_resort text,
  p_unit_ids text[],
  p_check_in date,
  p_check_out date,
  p_adults integer,
  p_children integer,
  p_name text,
  p_email text,
  p_phone text,
  p_notes text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_units text[];
  v_id uuid;
  v_ref text;
  v_amount integer;
  v_taken text[];
  v_expires timestamptz := now() + interval '48 hours';
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_email), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'Please fill in your name, email address and cellphone number.';
  end if;
  if trim(p_email) !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Please enter a valid email address.';
  end if;
  if coalesce(p_adults, 0) < 1 then
    raise exception 'Please tell us how many adults are coming.';
  end if;
  if length(p_name) > 120 or length(p_email) > 160 or length(p_phone) > 40 or length(coalesce(p_notes, '')) > 2000 then
    raise exception 'Some of your details are too long.';
  end if;

  select array_agg(distinct u) into v_units from unnest(p_unit_ids) u;
  perform check_stay(p_resort, v_units, p_check_in, p_check_out, true);

  if (
    select count(*) from bookings
    where lower(email) = lower(trim(p_email)) and status = 'pending' and created_at > now() - interval '1 day'
  ) >= 3 then
    raise exception 'You already have several booking requests waiting. We''ll be in touch soon.';
  end if;

  v_amount := stay_price_cents(v_units, p_check_in, p_check_out);
  v_ref := new_booking_ref();

  insert into bookings (
    ref, resort, check_in, check_out, unit_ids, adults, children, name, email, phone, guest_notes,
    amount_cents, status, source, hold_expires_at
  )
  values (
    v_ref, p_resort, p_check_in, p_check_out, v_units, p_adults, coalesce(p_children, 0), trim(p_name),
    trim(p_email), trim(p_phone), nullif(trim(coalesce(p_notes, '')), ''), v_amount, 'pending', 'online', v_expires
  )
  returning id into v_id;

  v_taken := claim_unit_nights(v_id, 'held', v_expires);
  if array_length(v_taken, 1) > 0 then
    -- Rolls back the booking too
    raise exception using
      message = 'Sorry, some of those units were just booked for your dates. Please choose again.',
      detail = array_to_string(v_taken, ','),
      errcode = 'P0001';
  end if;

  return json_build_object('id', v_id, 'ref', v_ref, 'amount_cents', v_amount, 'hold_expires_at', v_expires);
end;
$$;

-- ── Staff actions ────────────────────────────────────────────────────────────

-- A booking taken by phone, WhatsApp, at reception, etc. The units are booked straight away.
create or replace function staff_create_booking(
  p_resort text,
  p_unit_ids text[],
  p_check_in date,
  p_check_out date,
  p_adults integer,
  p_children integer,
  p_name text,
  p_email text,
  p_phone text,
  p_source text,
  p_paid boolean,
  p_amount_cents integer,
  p_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_units text[];
  v_id uuid;
  v_taken text[];
begin
  if not is_staff() then
    raise exception 'Not allowed';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Enter the guest''s name.';
  end if;

  select array_agg(distinct u) into v_units from unnest(p_unit_ids) u;
  perform check_stay(p_resort, v_units, p_check_in, p_check_out, false);

  insert into bookings (
    ref, resort, check_in, check_out, unit_ids, adults, children, name, email, phone, staff_notes,
    amount_cents, status, source, created_by
  )
  values (
    new_booking_ref(), p_resort, p_check_in, p_check_out, v_units, coalesce(p_adults, 1), coalesce(p_children, 0),
    trim(p_name), nullif(trim(coalesce(p_email, '')), ''), nullif(trim(coalesce(p_phone, '')), ''),
    nullif(trim(coalesce(p_notes, '')), ''),
    coalesce(p_amount_cents, stay_price_cents(v_units, p_check_in, p_check_out)),
    case when p_paid then 'paid' else 'confirmed' end, coalesce(p_source, 'other'), auth.uid()
  )
  returning id into v_id;

  v_taken := claim_unit_nights(v_id, 'booked', null);
  if array_length(v_taken, 1) > 0 then
    raise exception using
      message = 'Already booked on some of those nights: ' || array_to_string(v_taken, ', '),
      detail = array_to_string(v_taken, ','),
      errcode = 'P0001';
  end if;

  return v_id;
end;
$$;

-- Pending request → confirmed. Fails if the hold ran out and someone else took the units since.
create or replace function confirm_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_taken text[];
begin
  if not is_staff() then
    raise exception 'Not allowed';
  end if;
  if not exists (select 1 from bookings where id = p_booking_id and status = 'pending') then
    raise exception 'Only pending requests can be confirmed.';
  end if;

  v_taken := claim_unit_nights(p_booking_id, 'booked', null);
  if array_length(v_taken, 1) > 0 then
    raise exception 'The request''s hold ran out and these units have been booked since: %', array_to_string(v_taken, ', ');
  end if;

  update bookings set status = 'confirmed', hold_expires_at = null, updated_at = now() where id = p_booking_id;
end;
$$;

-- Pending or confirmed → paid
create or replace function mark_booking_paid(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_taken text[];
begin
  if not is_staff() then
    raise exception 'Not allowed';
  end if;
  if not exists (select 1 from bookings where id = p_booking_id and status in ('pending', 'confirmed')) then
    raise exception 'Only pending or confirmed bookings can be marked as paid.';
  end if;

  v_taken := claim_unit_nights(p_booking_id, 'booked', null);
  if array_length(v_taken, 1) > 0 then
    raise exception 'These units have been booked by someone else since: %', array_to_string(v_taken, ', ');
  end if;

  update bookings set status = 'paid', hold_expires_at = null, updated_at = now() where id = p_booking_id;
end;
$$;

-- Frees the units. p_status: 'declined' (request turned down) or 'cancelled'.
create or replace function cancel_booking(p_booking_id uuid, p_status text default 'cancelled')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_staff() then
    raise exception 'Not allowed';
  end if;
  if p_status not in ('cancelled', 'declined') then
    raise exception 'Unknown status %', p_status;
  end if;
  delete from unit_nights where booking_id = p_booking_id;
  update bookings
  set status = p_status, hold_expires_at = null, checked_in_at = null, updated_at = now()
  where id = p_booking_id and status in ('pending', 'confirmed', 'paid');
  if not found then
    raise exception 'This booking is already cancelled or declined.';
  end if;
end;
$$;

create or replace function set_checked_in(p_booking_id uuid, p_checked_in boolean)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_at timestamptz;
begin
  if not is_staff() then
    raise exception 'Not allowed';
  end if;
  update bookings
  set checked_in_at = case when p_checked_in then coalesce(checked_in_at, now()) else null end,
      checked_in_by = case when p_checked_in then auth.uid() else null end,
      updated_at = now()
  where id = p_booking_id and status in ('confirmed', 'paid')
  returning checked_in_at into v_at;
  if not found then
    raise exception 'Only confirmed or paid bookings can be checked in.';
  end if;
  return v_at;
end;
$$;

-- Staff notes and the amount due (e.g. after agreeing a discount)
create or replace function update_booking_details(p_booking_id uuid, p_staff_notes text, p_amount_cents integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_staff() then
    raise exception 'Not allowed';
  end if;
  if p_amount_cents is not null and p_amount_cents < 0 then
    raise exception 'The amount can''t be negative.';
  end if;
  update bookings
  set staff_notes = nullif(trim(coalesce(p_staff_notes, '')), ''),
      amount_cents = coalesce(p_amount_cents, amount_cents),
      updated_at = now()
  where id = p_booking_id;
end;
$$;

-- ── Permissions ──────────────────────────────────────────────────────────────

revoke execute on function stay_price_cents(text[], date, date) from public;
revoke execute on function get_unavailable_units(date, date) from public;
revoke execute on function request_booking(text, text[], date, date, integer, integer, text, text, text, text) from public;
grant execute on function stay_price_cents(text[], date, date) to anon, authenticated, service_role;
grant execute on function get_unavailable_units(date, date) to anon, authenticated, service_role;
grant execute on function request_booking(text, text[], date, date, integer, integer, text, text, text, text) to anon, authenticated, service_role;

revoke execute on function staff_create_booking(text, text[], date, date, integer, integer, text, text, text, text, boolean, integer, text) from public, anon;
revoke execute on function confirm_booking(uuid) from public, anon;
revoke execute on function mark_booking_paid(uuid) from public, anon;
revoke execute on function cancel_booking(uuid, text) from public, anon;
revoke execute on function set_checked_in(uuid, boolean) from public, anon;
revoke execute on function update_booking_details(uuid, text, integer) from public, anon;
grant execute on function staff_create_booking(text, text[], date, date, integer, integer, text, text, text, text, boolean, integer, text) to authenticated;
grant execute on function confirm_booking(uuid) to authenticated;
grant execute on function mark_booking_paid(uuid) to authenticated;
grant execute on function cancel_booking(uuid, text) to authenticated;
grant execute on function set_checked_in(uuid, boolean) to authenticated;
grant execute on function update_booking_details(uuid, text, integer) to authenticated;

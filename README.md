# Tan ‘n Biki – Paindane & Pleasure Bay

Vite + React + TypeScript website for Tan ‘n Biki (Paindane Beach Resort & Pleasure Bay Resort), with an
online booking system and a staff portal.

- **Three.js** – animated ocean and light particles over the hero (`src/three/OceanScene.ts`).
- **GSAP** (ScrollTrigger, SplitText, Flip) – preloader, hero slideshow, split headings, parallax, accommodation filter.
- **ScrollReveal** – section/card reveals (`src/hooks/useScrollReveal.ts`).

## Where to edit things

| What | File |
| --- | --- |
| Site text, images, contact details, accommodation list | `src/content.ts` |
| Privacy Policy / Disclaimer text | `src/legal.ts` |
| Bookable units, the site map positions, starting rates | `src/booking/units.ts` |
| Booking database (tables, rules, staff actions) | `supabase/migrations/` |

## Local development

```bash
npm install
npm run dev
```

Pages: `/` (home), `/privacy.html`, `/disclaimer.html` and the staff portal at **`/dssa-portals/`** (not linked from the site).

Without Supabase configured the site still works: the booking widget shows every unit as available and,
instead of saving the request, offers to send it by email or WhatsApp with everything filled in.

## Booking system

Guests choose a resort, their dates and guests, then pick units on the Paindane site map (drawn from the wall
map at reception) or from the list (Pleasure Bay, until its map is drawn). Sending the request:

1. creates a **pending** booking with a reference like `TB7K3F9A`,
2. **holds** the units on those nights for **48 hours**, so nobody else can request them,
3. staff then **confirm** (the hold becomes a booking), **mark paid**, or **decline** it in the portal.

A unit can never be double booked: `unit_nights` has one row per (unit, night), and every change goes through
database functions that lock and re-check availability. Requests whose hold ran out free their units
automatically; confirming one later only works if nobody took the units in the meantime.

Prices are the unit's nightly rate for each night (the peak rate on nights inside a peak period). Staff edit
rates, peak rates, peak periods and which units are bookable online in the portal under **Rates & seasons**.
The starting rates in `units.ts` are **placeholders**.

Online payment is not wired up yet. The `payment_provider` / `payment_reference` columns on `bookings` are
reserved for adding Yoco later (same approach as The Busker: an edge function that opens a Yoco checkout for a
held booking, and a webhook that marks it paid).

### Connecting Supabase

1. Create a Supabase project and run every file in `supabase/migrations/` in order (SQL editor or `supabase db push`).
2. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (Project settings → API).
   Set the same two variables on your host (e.g. Netlify) and redeploy.
3. Supabase → Authentication → Sign In / Providers: turn **off** “Allow new users to sign up”.
4. Authentication → URL Configuration: set the Site URL to the live domain and add
   `https://yourdomain.com/dssa-portals/` to the redirect URLs (used by “Forgot password?”).

### Giving someone access to the staff portal

1. Supabase → Authentication → Users → **Add user** → *Create new user*, with **Auto Confirm User** ticked.
2. In the SQL editor:
   ```sql
   insert into staff (user_id, email) select id, email from auth.users where email = 'them@example.com';
   ```
3. They sign in at `https://yourdomain.com/dssa-portals/`.

Accounts without a `staff` row can sign in but can't see or change anything.

### What staff can do in the portal

- **Bookings** – requests waiting for an answer, arrivals today, guests in house, upcoming, past and cancelled;
  search by name, reference, phone or unit. Open a booking to confirm, decline, mark paid, check in, cancel,
  change the amount due, add staff notes, or call / WhatsApp / email the guest.
- **Calendar** – a month grid of every unit per resort showing held, confirmed, paid and checked-in nights.
- **New booking** – record phone, WhatsApp, email or walk-in bookings straight onto the map. Staff can also book
  units that aren't bookable online.
- **Rates & seasons** – nightly and peak rates per unit (or for a whole category at once), bookable online on/off,
  and the peak periods.

### Changing the units or the site map

Edit `src/booking/units.ts` (each unit's id, category, name, sleeps, description, starting rate and map
position), then generate and apply the SQL:

```bash
npm run units:sql > supabase/migrations/0003_units.sql
```

Existing units keep the rates and “bookable online” setting staff have set in the portal.

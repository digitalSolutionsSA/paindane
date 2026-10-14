// Every bookable unit / campsite, with its spot on the Paindane site map (drawn from the painted
// wall map at reception). Map coordinates are SVG units in MAP_VIEWBOX.
//
// The ids must match the `units` table. After adding or renaming units here run
//   npm run units:sql > supabase/migrations/<next number>_units.sql
// and apply that migration. Rates and "bookable online" are managed by staff in the portal, so the
// rates below are only the starting values for new units.
//
// This file is also imported by scripts/generate-units-sql.ts, so it must not import anything.

export type ResortId = 'paindane' | 'pleasure-bay';

export type Shape = 'tent' | 'casita' | 'baracca' | 'house' | 'thatch' | 'rondavel' | 'bighouse';

export interface MapSpot {
  shape: Shape;
  x: number;
  y: number;
  rotate?: number;
}

export interface UnitSeed {
  id: string;
  resort: ResortId;
  category: string;
  name: string;
  sleeps: number | null;
  /** Short description shown in the booking panel */
  description: string;
  /** Starting nightly rate in rand (placeholder until staff set real rates) */
  rate: number;
  /** Name of the matching card in the website's accommodation list, if any */
  listing?: string;
  /** False = shown on the map but not bookable online until staff switch it on */
  active?: boolean;
  map?: MapSpot;
}

export const RESORTS: { id: ResortId; name: string }[] = [
  { id: 'paindane', name: 'Paindane' },
  { id: 'pleasure-bay', name: 'Pleasure Bay' },
];

/** The whole illustrated map, including the beach on the right */
export const MAP_SIZE = { w: 1700, h: 650 };
export const MAP_VIEWBOX = `0 0 ${MAP_SIZE.w} ${MAP_SIZE.h}`;

/** Areas the map can fly to (SVG units) */
export const MAP_ZONES = [
  { id: 'all', label: 'Whole resort', x: 0, y: 0, w: 1700, h: 650 },
  { id: 'chalets', label: 'Chalets & rondavels', x: 0, y: 10, w: 600, h: 500 },
  { id: 'camp', label: 'Campsites', x: 545, y: 0, w: 960, h: 470 },
  { id: 'beach', label: 'Beach', x: 1180, y: 0, w: 520, h: 650 },
] as const;

/** Display order and colours of the categories */
export const CATEGORIES: Record<string, { color: string; label: string }> = {
  'Luxury Houses': { color: '#c9b48a', label: 'Luxury House' },
  Chalets: { color: '#e9dcc3', label: 'Chalet' },
  Rondavels: { color: '#3d6fb6', label: 'Rondavel' },
  Casita: { color: '#1f56a3', label: 'Casita site' },
  Baracca: { color: '#f0cfc4', label: 'Baracca site' },
  'Open Camp': { color: '#2f6b35', label: 'Open camp site' },
  Units: { color: '#2fb4c6', label: 'Unit' },
  Houses: { color: '#304b66', label: 'House' },
};

const luxury = '3 x Bedrooms, 2 x Bathrooms, Kitchen, Open plan Lounge & Dining room, Verandah, Braai, Aircon, Wifi & Swimming Pool';
const chalet6 = '3 x Bedrooms, 2 x Bathrooms, Kitchen, Open plan Lounge & Dining room, Verandah & Braai';
const chalet7 = '2 x Bedrooms, 1 x Bathrooms, Kitchen, Open plan Lounge, Veranda & Braai';
const chalet8 = '4 x Bedrooms, 2 Bathrooms, Kitchen, Open plan Lounge & Dining room, Verandah/Gazebo & Braai';
const rondavel2 = '2 x Bedrooms, Lounge, Kitchen & Bathroom';
const rondavel1 = '1 x Bedroom, Lounge, Kitchen & Bathroom';
const casita = '8m x 6m site. Own ablution – Toilet, Shower, Hand basin, Geyser & Kitchenette';
const baracca = '8m x 4m site with prep bowl, plug point, work surface and a light – 5AMP PLUG ONLY';
const openSite = 'Open site with gazebo, 12m x 24m with plug point – for household electric freezer only – 5AMP PLUGS ONLY';
const unconfirmed = 'On the site map but not listed on the website yet – details to be confirmed.';

const pd = (u: Omit<UnitSeed, 'resort'>): UnitSeed => ({ ...u, resort: 'paindane' });
const pb = (u: Omit<UnitSeed, 'resort'>): UnitSeed => ({ ...u, resort: 'pleasure-bay' });

export const UNITS: UnitSeed[] = [
  // ── Paindane: luxury houses & chalets ─────────────────────────────────────
  pd({ id: 'pd-h8', category: 'Luxury Houses', name: 'Luxury House 8', sleeps: 6, description: luxury, rate: 3500, listing: 'Luxury House 8 (3 x Bed House)', map: { shape: 'house', x: 210, y: 105 } }),
  pd({ id: 'pd-h10', category: 'Luxury Houses', name: 'Luxury House 10', sleeps: 6, description: luxury, rate: 3500, listing: 'Luxury House 10 (3 x Bed House)', map: { shape: 'house', x: 60, y: 105 } }),
  pd({ id: 'pd-h25', category: 'Luxury Houses', name: 'Luxury House 25', sleeps: 6, description: luxury, rate: 3500, listing: 'Luxury House 25 (3 x Bed House)', map: { shape: 'thatch', x: 135, y: 352 } }),
  pd({ id: 'pd-h11', category: 'Luxury Houses', name: 'Luxury House 11', sleeps: 12, description: luxury.replace('3 x', '6 x'), rate: 5500, listing: 'Luxury House 11 (6 x Bed House)', map: { shape: 'thatch', x: 860, y: 520 } }),

  pd({ id: 'pd-h6', category: 'Chalets', name: 'Chalet 6', sleeps: 7, description: chalet7, rate: 2400, listing: 'Chalet 6 (7 x Bed)', map: { shape: 'house', x: 360, y: 105 } }),
  pd({ id: 'pd-h7', category: 'Chalets', name: 'Chalet 7', sleeps: 7, description: chalet7, rate: 2400, listing: 'Chalet 7 (7 x Bed)', map: { shape: 'house', x: 285, y: 105 } }),
  pd({ id: 'pd-h9', category: 'Chalets', name: 'Chalet 9', sleeps: 7, description: chalet7, rate: 2400, listing: 'Chalet 9 (7 x Bed)', map: { shape: 'house', x: 135, y: 105 } }),
  pd({ id: 'pd-h12', category: 'Chalets', name: 'Chalet 12', sleeps: 8, description: chalet8, rate: 2800, listing: 'Chalet 12 (8 x Bed)', map: { shape: 'thatch', x: 1040, y: 485 } }),
  pd({ id: 'pd-h13', category: 'Chalets', name: 'Chalet 13', sleeps: 8, description: chalet8, rate: 2800, listing: 'Chalet 13 (8 x Bed)', map: { shape: 'thatch', x: 1135, y: 515 } }),
  pd({ id: 'pd-h15', category: 'Chalets', name: 'Chalet 15', sleeps: 8, description: chalet8, rate: 2800, listing: 'Chalet 15 (8 x Bed)', map: { shape: 'thatch', x: 1120, y: 400 } }),
  pd({ id: 'pd-h16', category: 'Chalets', name: 'Chalet 16', sleeps: 8, description: '3 x Bedrooms, 2 Bathrooms, Kitchen, Open plan Lounge & Dining room, Verandah & Braai', rate: 2800, listing: 'Chalet 16 (8 x Bed)', map: { shape: 'house', x: 470, y: 105 } }),
  pd({ id: 'pd-h21', category: 'Chalets', name: 'Chalet 21', sleeps: 6, description: chalet6, rate: 2200, listing: 'Chalet 21 (6 x Bed)', map: { shape: 'thatch', x: 395, y: 352 } }),
  pd({ id: 'pd-h22', category: 'Chalets', name: 'Chalet 22', sleeps: 6, description: chalet6, rate: 2200, listing: 'Chalet 22 (6 x Bed)', map: { shape: 'thatch', x: 330, y: 352 } }),
  pd({ id: 'pd-h23', category: 'Chalets', name: 'Chalet 23', sleeps: 6, description: chalet6, rate: 2200, listing: 'Chalet 23 (6 x Bed)', map: { shape: 'thatch', x: 265, y: 352 } }),
  pd({ id: 'pd-h24', category: 'Chalets', name: 'Chalet 24', sleeps: 6, description: chalet6, rate: 2200, listing: 'Chalet 24 (6 x Bed)', map: { shape: 'thatch', x: 200, y: 352 } }),
  // On the wall map, not on the website: not bookable until confirmed
  pd({ id: 'pd-h14', category: 'Chalets', name: 'Chalet 14', sleeps: null, description: unconfirmed, rate: 2800, active: false, map: { shape: 'thatch', x: 1215, y: 400 } }),
  pd({ id: 'pd-h19', category: 'Chalets', name: 'House 19', sleeps: null, description: unconfirmed, rate: 2800, active: false, map: { shape: 'bighouse', x: 70, y: 420 } }),
  pd({ id: 'pd-h26', category: 'Chalets', name: 'Chalet 26', sleeps: null, description: unconfirmed, rate: 2800, active: false, map: { shape: 'thatch', x: 760, y: 520 } }),

  // ── Paindane: rondavels ───────────────────────────────────────────────────
  pd({ id: 'pd-r1', category: 'Rondavels', name: 'Rondavel 1', sleeps: 6, description: rondavel2, rate: 1600, listing: 'Rondavel 1 (6 x Bed)', map: { shape: 'rondavel', x: 410, y: 240 } }),
  pd({ id: 'pd-r2', category: 'Rondavels', name: 'Rondavel 2', sleeps: 6, description: rondavel2, rate: 1600, listing: 'Rondavel 2 (6 x Bed)', map: { shape: 'rondavel', x: 330, y: 240 } }),
  pd({ id: 'pd-r3', category: 'Rondavels', name: 'Rondavel 3', sleeps: 4, description: rondavel1, rate: 1200, listing: 'Rondavel 3 (4 x Bed)', map: { shape: 'rondavel', x: 250, y: 240 } }),
  pd({ id: 'pd-r4', category: 'Rondavels', name: 'Rondavel 4', sleeps: 4, description: rondavel1, rate: 1200, listing: 'Rondavel 4 (4 x Bed)', map: { shape: 'rondavel', x: 170, y: 240 } }),
  pd({ id: 'pd-r5', category: 'Rondavels', name: 'Rondavel 5', sleeps: 4, description: rondavel1, rate: 1200, listing: 'Rondavel 5 (4 x Bed)', map: { shape: 'rondavel', x: 90, y: 240 } }),

  // ── Paindane: campsites ───────────────────────────────────────────────────
  ...[
    [3, 775, 70],
    [4, 825, 70],
    [5, 900, 70],
    [6, 950, 70],
    [7, 1025, 70],
    [8, 1075, 70],
  ].map(([n, x, y]) => pd({ id: `pd-s${n}`, category: 'Casita', name: `Casita Site ${n}`, sleeps: null, description: casita, rate: 650, listing: 'Casita', map: { shape: 'casita', x, y } })),
  pd({ id: 'pd-s9', category: 'Casita', name: 'Casita Site 9', sleeps: null, description: casita, rate: 650, listing: 'Casita', map: { shape: 'casita', x: 1150, y: 130, rotate: 62 } }),
  pd({ id: 'pd-s10', category: 'Casita', name: 'Casita Site 10', sleeps: null, description: casita, rate: 650, listing: 'Casita', map: { shape: 'casita', x: 1172, y: 175, rotate: 62 } }),

  ...[
    [1, 600, 70],
    [2, 670, 70],
    [18, 600, 170],
    [17, 670, 170],
    [16, 740, 170],
    [15, 810, 170],
    [14, 880, 170],
    [11, 1270, 175],
    [12, 1345, 175],
  ].map(([n, x, y]) => pd({ id: `pd-s${n}`, category: 'Open Camp', name: `Open Site ${n}`, sleeps: null, description: openSite, rate: 350, listing: 'OPEN SITE with Gazebo', map: { shape: 'tent', x, y } })),

  ...[
    [19, 600, 272],
    [20, 670, 272],
    [21, 740, 272],
    [22, 810, 272],
    [23, 880, 272],
    [24, 950, 272],
    [25, 1020, 272],
    [26, 1090, 272],
    [28, 1255, 305],
    [31, 1010, 398],
    [32, 900, 398],
    [33, 780, 398],
  ].map(([n, x, y]) => pd({ id: `pd-s${n}`, category: 'Baracca', name: `Baracca Site ${n}`, sleeps: null, description: baracca, rate: 450, listing: 'Baracca', map: { shape: 'baracca', x, y } })),
  // On the wall map, not in the website's Baracca list: not bookable until confirmed
  pd({ id: 'pd-s13', category: 'Baracca', name: 'Baracca Site 13', sleeps: null, description: unconfirmed, rate: 450, active: false, map: { shape: 'baracca', x: 950, y: 170 } }),
  pd({ id: 'pd-s27', category: 'Baracca', name: 'Baracca Site 27', sleeps: null, description: unconfirmed, rate: 450, active: false, map: { shape: 'baracca', x: 1255, y: 250 } }),

  // ── Pleasure Bay (no site map yet: shown as a list) ───────────────────────
  pb({ id: 'pb-nemo-dory', category: 'Units', name: 'Nemo & Dory', sleeps: 4, description: 'Interleading Double rooms', rate: 900, listing: 'Nemo & Dory' }),
  pb({ id: 'pb-domino-goldie', category: 'Units', name: 'Domino & Goldie', sleeps: 4, description: 'Double room + bunk bed. Goldie includes Large Balcony', rate: 900, listing: 'Domino & Goldie' }),
  pb({ id: 'pb-starfish-angelfish', category: 'Units', name: 'Starfish & Angel Fish (Honeymoon Unit)', sleeps: 4, description: 'Interleading Double room + bunk bed', rate: 1000, listing: 'Starfish & Angel Fish (Honeymoon Unit)' }),
  pb({ id: 'pb-frogfish-tigerfish', category: 'Units', name: 'Frog Fish & Tiger Fish', sleeps: 3, description: 'Double room + single bed', rate: 850, listing: 'Frog Fish & Tiger Fish' }),
  pb({ id: 'pb-marlin', category: 'Houses', name: 'Marlin', sleeps: 8, description: '2 x Double + 2 Single Bedrooms – 2 Beds per Room', rate: 2600, listing: 'Marlin (8 Sleeper)' }),
  pb({ id: 'pb-manatee', category: 'Houses', name: 'Manatee', sleeps: 8, description: '1 x Double + 3 Single Bedrooms – 2 Beds per Room', rate: 2600, listing: 'Manatee (8 Sleeper)' }),
  pb({ id: 'pb-periwinkel', category: 'Houses', name: 'Periwinkel', sleeps: 6, description: '1 x Double + 2 Single Bedrooms – 2 Beds per Room', rate: 2200, listing: 'Periwinkel (6 Sleeper)' }),
  pb({ id: 'pb-orca', category: 'Houses', name: 'Orca', sleeps: 8, description: '1 x Double + 3 Single Bedrooms – 2 Beds per Room', rate: 2600, listing: 'Orca (8 Sleeper)' }),
  pb({ id: 'pb-dugomgo', category: 'Houses', name: 'Dugomgo', sleeps: 8, description: '1 x Double + 3 Single Bedrooms – 2 Beds per Room', rate: 2600, listing: 'Dugomgo (8 Sleeper)' }),
];

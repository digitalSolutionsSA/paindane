import type { KeyboardEvent, Ref } from 'react';
import type { Unit } from './api';
import { CATEGORIES, MAP_SIZE, MAP_VIEWBOX, type MapSpot } from './units';

export type UnitState = 'free' | 'selected' | 'taken' | 'inactive';

export interface SiteMapProps {
  units: Unit[];
  stateOf: (u: Unit) => UnitState;
  onToggle: (u: Unit) => void;
  /** Called with the unit and its element when the pointer / focus enters it, and with null when it leaves */
  onHover?: (u: Unit | null, el?: SVGGElement) => void;
  svgRef?: Ref<SVGSVGElement>;
}

/** Number shown on the map: the unit's own number from its name ("Chalet 21" → 21) */
const numberOf = (u: Unit) => u.name.match(/\d+/)?.[0] ?? '';

const ink = { dark: '#23303d', light: '#ffffff' };
const shadow = 'rgba(92, 66, 30, 0.28)';

function Building({ spot, unit, state }: { spot: MapSpot; unit: Unit; state: UnitState }) {
  const { x, y } = spot;
  const n = numberOf(unit);
  const base = CATEGORIES[unit.category]?.color ?? '#ddd';
  const sel = state === 'selected';
  const stroke = sel ? '#304b66' : 'rgba(35,48,61,.35)';
  const sw = sel ? 3 : 1.2;
  const label = (cx: number, cy: number, color: string, size = 17) => (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="sm-num" fill={color} fontSize={size}>
      {n}
    </text>
  );

  switch (spot.shape) {
    case 'tent':
      return (
        <>
          <ellipse cx={x + 6} cy={y + 20} rx={26} ry={7} fill={shadow} />
          <polygon points={`${x},${y - 24} ${x - 25},${y + 18} ${x + 25},${y + 18}`} fill={base} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <polygon points={`${x},${y - 24} ${x + 25},${y + 18} ${x + 6},${y + 18}`} fill="rgba(0,0,0,.18)" />
          {label(x - 2, y + 4, ink.light)}
        </>
      );
    case 'casita':
    case 'baracca':
      return (
        <>
          <rect x={x - 18} y={y - 2} width={48} height={30} fill={shadow} rx={3} />
          <polygon points={`${x - 24},${y - 10} ${x - 10},${y - 26} ${x + 10},${y - 26} ${x + 24},${y - 10}`} fill="#6f6a66" />
          <polygon points={`${x + 10},${y - 26} ${x + 24},${y - 10} ${x},${y - 10}`} fill="rgba(0,0,0,.18)" />
          <rect x={x - 24} y={y - 10} width={48} height={32} fill={base} stroke={stroke} strokeWidth={sw} />
          {label(x, y + 6, spot.shape === 'casita' ? ink.light : ink.dark)}
        </>
      );
    case 'house':
      return (
        <>
          <rect x={x - 20} y={y - 4} width={56} height={36} fill={shadow} rx={3} />
          <polygon points={`${x - 30},${y - 12} ${x},${y - 34} ${x + 30},${y - 12}`} fill="#6f6a66" />
          <polygon points={`${x},${y - 34} ${x + 30},${y - 12} ${x},${y - 12}`} fill="rgba(0,0,0,.2)" />
          <rect x={x - 28} y={y - 12} width={56} height={38} fill={base} stroke={stroke} strokeWidth={sw} />
          {label(x, y + 7, ink.dark)}
        </>
      );
    case 'thatch':
      return (
        <>
          <rect x={x - 20} y={y} width={56} height={30} fill={shadow} rx={4} />
          <path d={`M${x - 32} ${y - 8} Q${x - 22} ${y - 42} ${x} ${y - 42} Q${x + 22} ${y - 42} ${x + 32} ${y - 8} Z`} fill="#4a4a4a" />
          <path d={`M${x} ${y - 42} Q${x + 22} ${y - 42} ${x + 32} ${y - 8} H${x + 4} Z`} fill="rgba(0,0,0,.22)" />
          <path d={`M${x - 20} ${y - 14} L${x - 8} ${y - 36} M${x} ${y - 12} V${y - 40} M${x + 20} ${y - 14} L${x + 8} ${y - 36}`} stroke="#777" strokeWidth={1.2} />
          <rect x={x - 28} y={y - 8} width={56} height={32} fill={base} stroke={stroke} strokeWidth={sw} />
          {label(x, y + 8, ink.dark)}
        </>
      );
    case 'rondavel':
      return (
        <>
          <rect x={x - 16} y={y} width={44} height={22} fill={shadow} rx={3} />
          <polygon points={`${x - 24},${y - 6} ${x},${y - 22} ${x + 24},${y - 6}`} fill={base} />
          <rect x={x - 22} y={y - 6} width={44} height={24} fill="#f7f2ea" stroke={stroke} strokeWidth={sw} />
          {label(x, y + 6, ink.dark, 14)}
        </>
      );
    case 'bighouse':
      return (
        <>
          <rect x={x - 42} y={y - 8} width={100} height={52} fill={shadow} rx={4} />
          <polygon points={`${x - 52},${y - 16} ${x},${y - 46} ${x + 52},${y - 16}`} fill="#4a4a4a" />
          <polygon points={`${x},${y - 46} ${x + 52},${y - 16} ${x},${y - 16}`} fill="rgba(0,0,0,.2)" />
          <rect x={x - 50} y={y - 16} width={100} height={54} fill="#f7f2ea" stroke={stroke} strokeWidth={sw} />
          {label(x, y + 11, ink.dark, 20)}
        </>
      );
  }
}

export default function SiteMap({ units, stateOf, onToggle, onHover, svgRef }: SiteMapProps) {
  const placed = units.filter((u) => u.map);

  const act = (u: Unit, state: UnitState) => {
    if (state === 'taken' || state === 'inactive') return;
    onToggle(u);
  };

  return (
    <svg ref={svgRef} viewBox={MAP_VIEWBOX} className="site-map" role="group" aria-label="Paindane site map" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="sm-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#304b66" floodOpacity=".45" />
        </filter>
        {/* Cheap sand texture: a tiny repeating dot pattern instead of a full-size noise filter */}
        <pattern id="sm-grain" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="3" r="0.8" fill="rgba(120,90,45,.16)" />
          <circle cx="7" cy="7" r="0.6" fill="rgba(120,90,45,.12)" />
        </pattern>
        {/* Soft cloud shadow as a gradient (a blur filter would be redrawn every frame) */}
        <radialGradient id="sm-cloud">
          <stop offset="0" stopColor="rgba(40,50,60,.13)" />
          <stop offset="1" stopColor="rgba(40,50,60,0)" />
        </radialGradient>
        <pattern id="sm-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(35,48,61,.35)" strokeWidth="2" />
        </pattern>
        <linearGradient id="sm-sand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3e5c3" />
          <stop offset="1" stopColor="#e9d4a6" />
        </linearGradient>
        <linearGradient id="sm-sea" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8fd8d8" />
          <stop offset="0.35" stopColor="#3fb3c6" />
          <stop offset="1" stopColor="#1f6f93" />
        </linearGradient>
        <radialGradient id="sm-vignette" cx="0.45" cy="0.45" r="0.75">
          <stop offset="0.6" stopColor="rgba(0,0,0,0)" />
          <stop offset="1" stopColor="rgba(60,40,15,.18)" />
        </radialGradient>
      </defs>

      <Ground />

      {placed.map((u) => {
        const spot = u.map!;
        const state = stateOf(u);
        const interactive = state === 'free' || state === 'selected';
        const desc =
          state === 'taken' ? 'booked for your dates' : state === 'inactive' ? 'not bookable online' : state === 'selected' ? 'selected' : 'available';
        return (
          <g
            key={u.id}
            className={`sm-unit is-${state}`}
            transform={spot.rotate ? `rotate(${spot.rotate} ${spot.x} ${spot.y})` : undefined}
            role="button"
            tabIndex={interactive ? 0 : -1}
            aria-pressed={state === 'selected'}
            aria-disabled={!interactive}
            aria-label={`${u.name}, ${desc}`}
            onClick={() => act(u, state)}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                act(u, state);
              }
            }}
            onMouseEnter={(e) => onHover?.(u, e.currentTarget)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={(e) => onHover?.(u, e.currentTarget)}
            onBlur={() => onHover?.(null)}
          >
            <title>{`${u.name} – ${desc}`}</title>
            {/* Bigger invisible hit area for fingers */}
            <circle cx={spot.x} cy={spot.y} r={34} fill="transparent" />
            {state === 'selected' && <circle className="sm-pulse" cx={spot.x} cy={spot.y} r={36} />}
            <g className="sm-body" style={{ transformOrigin: `${spot.x}px ${spot.y}px` }}>
              <g className="sm-pop">
                <Building spot={spot} unit={u} state={state} />
              </g>
              {state === 'taken' && (
                <>
                  <circle cx={spot.x} cy={spot.y} r={24} fill="url(#sm-hatch)" />
                  <path
                    d={`M${spot.x - 12} ${spot.y - 12} L${spot.x + 12} ${spot.y + 12} M${spot.x + 12} ${spot.y - 12} L${spot.x - 12} ${spot.y + 12}`}
                    stroke="#9a3b2e"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                  />
                </>
              )}
              {state === 'selected' && (
                <g transform={`translate(${spot.x + 22} ${spot.y - 30})`}>
                  <circle r={11} fill="#304b66" stroke="#fff" strokeWidth={2} />
                  <path d="M-5 0 L-1.5 3.5 L5 -3.5" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )}
            </g>
          </g>
        );
      })}

      <Sky />
    </svg>
  );
}

// ── Scenery ──────────────────────────────────────────────────────────────────

/** Sandy tracks: an edge, the track, and dashed tyre marks. pathLength 1 lets them "draw" in. */
const ROADS: { d: string; w?: number }[] = [
  { d: 'M545 20 V615' },
  { d: 'M30 150 H545' },
  { d: 'M545 205 H70 Q50 205 50 225 V330' },
  { d: 'M110 395 H430 L545 470', w: 22 },
  { d: 'M545 115 H1125 L1205 225 V345' },
  { d: 'M545 215 H1160' },
  { d: 'M545 345 H1440 L1470 30' },
  { d: 'M545 568 H1170' },
];

/** Deterministic scatter so grass tufts don't jump around between renders */
const scatter = (n: number, seed: number, box: [number, number, number, number]) => {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: n }, () => ({ x: box[0] + rnd() * box[2], y: box[1] + rnd() * box[3], r: rnd() }));
};
const tufts = [...scatter(55, 7, [20, 40, 500, 560]), ...scatter(70, 13, [560, 20, 930, 600]), ...scatter(30, 29, [1480, 20, 80, 610])];

function Palm({ x, y, s = 1, d = 0 }: { x: number; y: number; s?: number; d?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="sm-palm sm-scenery">
      <ellipse cx={18} cy={2} rx={30} ry={7} fill="rgba(92,66,30,.18)" />
      <path d="M0 0 C3 -25 -2 -50 2 -70" stroke="#5a4636" strokeWidth={4} fill="none" strokeLinecap="round" />
      <g className="sm-fronds" style={{ animationDelay: `${d}s` }}>
        {[-70, -35, 0, 35, 70, 110, -110, 150].map((a) => (
          <path key={a} d="M2 -70 q14 -8 30 6" stroke={a % 70 === 0 ? '#2f7d3a' : '#3d9447'} strokeWidth={5} fill="none" strokeLinecap="round" transform={`rotate(${a} 2 -70)`} />
        ))}
        <circle cx={2} cy={-70} r={4} fill="#6b4f2a" />
      </g>
    </g>
  );
}

function Bush({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="sm-scenery">
      <ellipse cx={6} cy={10} rx={26} ry={8} fill="rgba(92,66,30,.15)" />
      <circle cx={-10} cy={0} r={13} fill="#6f9a5c" />
      <circle cx={8} cy={-6} r={16} fill="#7fab69" />
      <circle cx={20} cy={4} r={11} fill="#6a9457" />
    </g>
  );
}

function Acacia({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="sm-scenery">
      <ellipse cx={20} cy={4} rx={50} ry={10} fill="rgba(92,66,30,.18)" />
      <path d="M0 0 V-40 M0 -28 L-14 -44 M0 -32 L12 -46" stroke="#8a7d68" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={0} cy={-50} rx={46} ry={14} fill="#5f7d5a" />
      <ellipse cx={-8} cy={-60} rx={30} ry={9} fill="#6d8c66" />
    </g>
  );
}

function Facility({ x, y, w, h, label, roof = true }: { x: number; y: number; w: number; h: number; label: string; roof?: boolean }) {
  return (
    <g aria-hidden className="sm-scenery">
      <rect x={x + 8} y={y + 8} width={w} height={h} fill={shadow} rx={3} />
      {roof && <polygon points={`${x - 2},${y} ${x + w / 2},${y - h * 0.45} ${x + w + 2},${y}`} fill="#c23b2c" />}
      {roof && <polygon points={`${x + w / 2},${y - h * 0.45} ${x + w + 2},${y} ${x + w / 2},${y}`} fill="rgba(0,0,0,.18)" />}
      <rect x={x} y={y} width={w} height={h} fill="#f2c36b" stroke="rgba(35,48,61,.25)" />
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="central" className="sm-facility">
        {label}
      </text>
    </g>
  );
}

function Caption({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" className="sm-caption sm-scenery">
      {children}
    </text>
  );
}

function Ground() {
  const { w, h } = MAP_SIZE;
  return (
    <g aria-hidden className="sm-decor">
      {/* Sand, dunes and lawns */}
      <rect x={0} y={0} width={w} height={h} fill="url(#sm-sand)" />
      <path d="M0 470 C120 440 260 520 420 500 S700 560 900 600 L900 650 H0 Z" fill="#ecd9ae" />
      <rect x={18} y={55} width={505} height={420} rx={70} fill="#d9e4bd" opacity={0.85} />
      <rect x={565} y={22} width={920} height={545} rx={60} fill="#efe1bc" />
      <circle cx={630} cy={515} r={92} fill="#e6d2a6" />
      <circle cx={630} cy={515} r={78} fill="none" stroke="#d6bf90" strokeWidth={2} strokeDasharray="4 7" />
      {tufts.map((t, i) => (
        <path
          key={i}
          d={`M${t.x} ${t.y} l-3 -8 M${t.x} ${t.y} l0 -10 M${t.x} ${t.y} l3 -8`}
          stroke={t.r > 0.5 ? '#8fae6b' : '#a3b97a'}
          strokeWidth={1.6}
          strokeLinecap="round"
          className="sm-scenery"
        />
      ))}

      {/* Beach and ocean */}
      <path d="M1490 0 C1520 120 1500 260 1530 380 S1515 560 1540 650 H1700 V0 Z" fill="#e4d1a0" />
      <path d="M1545 0 C1570 140 1555 280 1580 400 S1565 560 1585 650 H1700 V0 Z" fill="#f6ead0" />
      <path d="M1600 0 C1625 140 1610 280 1632 400 S1618 560 1638 650 H1700 V0 Z" fill="#dcc79a" />
      <g className="sm-sea">
        <path d="M1612 0 C1637 140 1622 280 1644 400 S1630 560 1650 650 H1700 V0 Z" fill="url(#sm-sea)" />
        <path className="sm-foam sm-foam-1" d="M1616 0 C1641 140 1626 280 1648 400 S1634 560 1654 650" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
        <path className="sm-foam sm-foam-2" d="M1630 0 C1655 140 1640 280 1662 400 S1648 560 1668 650" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" opacity={0.5} strokeDasharray="30 22" />
        <path className="sm-foam sm-foam-3" d="M1650 0 C1675 140 1660 280 1682 400 S1668 560 1688 650" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.35} strokeDasharray="18 30" />
      </g>
      <g className="sm-boat sm-scenery">
        <path d="M1662 438 h26 l-5 9 h-16 z" fill="#c23b2c" />
        <path d="M1675 438 V414 L1688 434 Z" fill="#f7f2ea" />
      </g>
      <text x={1685} y={190} className="sm-sea-label sm-scenery" transform="rotate(90 1685 190)">
        INDIAN OCEAN
      </text>
      <text x={1568} y={470} className="sm-beach-label sm-scenery" transform="rotate(84 1568 470)">
        PAINDANE BEACH
      </text>

      {/* Tracks */}
      {ROADS.map((r) => (
        <path key={`e${r.d}`} d={r.d} className="sm-road" pathLength={1} fill="none" stroke="#cfb381" strokeWidth={(r.w ?? 18) + 6} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {ROADS.map((r) => (
        <path key={`b${r.d}`} d={r.d} className="sm-road" pathLength={1} fill="none" stroke="#eedfbd" strokeWidth={r.w ?? 18} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {ROADS.map((r) => (
        <path key={`t${r.d}`} d={r.d} className="sm-scenery" fill="none" stroke="#d6bf92" strokeWidth={1.6} strokeDasharray="10 9" strokeLinecap="round" />
      ))}

      {/* Boardwalk to the beach */}
      <g className="sm-scenery">
        <rect x={1458} y={176} width={140} height={18} fill="#a77d52" rx={2} />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={1462 + i * 10} y1={176} x2={1462 + i * 10} y2={194} stroke="#8a643e" strokeWidth={1.4} />
        ))}
      </g>

      {/* Landmarks */}
      <Caption x={265} y={182}>CHALET</Caption>
      <Caption x={265} y={300}>CHALET</Caption>
      <Caption x={900} y={30}>CASITA</Caption>
      <Caption x={760} y={244}>OPEN CAMP</Caption>
      <Caption x={950} y={332}>BARACCA</Caption>
      <Caption x={930} y={455}>CHALET</Caption>
      <Facility x={430} y={22} w={80} h={36} label="KITCHEN" />
      <Facility x={1010} y={150} w={92} h={42} label="KITCHEN" />
      <Facility x={575} y={298} w={100} h={34} label="ABLUTION" roof={false} />
      <Facility x={700} y={298} w={86} h={34} label="KITCHEN" />
      <Facility x={570} y={485} w={120} h={60} label="RECEPTION" />

      <Palm x={415} y={128} s={0.8} d={0.4} />
      <Palm x={95} y={385} s={0.75} d={1.2} />
      <Palm x={448} y={385} s={0.75} d={0.1} />
      <Palm x={725} y={95} s={0.8} d={0.9} />
      <Palm x={1395} y={200} s={0.75} d={1.6} />
      <Palm x={1105} y={98} s={0.7} d={0.3} />
      <Palm x={920} y={555} s={0.8} d={1.1} />
      <Palm x={1185} y={540} s={0.75} d={0.6} />
      <Palm x={1520} y={110} s={0.9} d={0.8} />
      <Palm x={1530} y={330} s={0.85} d={1.4} />
      <Palm x={1515} y={560} s={0.9} d={0.2} />
      <Palm x={30} y={610} s={0.8} d={1.7} />
      <Acacia x={490} y={455} />
      <Bush x={300} y={560} />
      <Bush x={150} y={520} s={0.8} />
      <Bush x={1300} y={460} s={0.9} />
      <Bush x={1400} y={570} />
      <Bush x={1250} y={60} s={0.8} />
      <Bush x={760} y={615} s={0.8} />

      <text x={545} y={640} textAnchor="middle" className="sm-caption sm-entrance sm-scenery">
        ENTRANCE
      </text>

      <rect x={0} y={0} width={w} height={h} fill="url(#sm-grain)" />
    </g>
  );
}

/** Drifting cloud shadows and a soft vignette, above everything but never in the way */
function Sky() {
  return (
    <g aria-hidden className="sm-sky">
      <g className="sm-cloud sm-cloud-1">
        <ellipse cx={0} cy={180} rx={220} ry={95} fill="url(#sm-cloud)" />
      </g>
      <g className="sm-cloud sm-cloud-2">
        <ellipse cx={0} cy={470} rx={290} ry={120} fill="url(#sm-cloud)" />
      </g>
      <rect x={0} y={0} width={MAP_SIZE.w} height={MAP_SIZE.h} fill="url(#sm-vignette)" />
    </g>
  );
}

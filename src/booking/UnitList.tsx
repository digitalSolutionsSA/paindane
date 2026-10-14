import type { Unit } from './api';
import { CATEGORIES } from './units';
import { formatRand } from './dates';
import type { UnitState } from './SiteMap';

interface Props {
  units: Unit[];
  stateOf: (u: Unit) => UnitState;
  onToggle: (u: Unit) => void;
  /** Price for the chosen stay, or null when no dates are picked yet */
  priceOf: (u: Unit) => number | null;
}

const badge: Record<UnitState, string> = {
  free: 'Available',
  selected: 'Selected',
  taken: 'Booked',
  inactive: 'Call to book',
};

/** Units grouped by category, as selectable cards */
export default function UnitList({ units, stateOf, onToggle, priceOf }: Props) {
  const groups = Object.keys(CATEGORIES)
    .map((c) => ({ category: c, units: units.filter((u) => u.category === c) }))
    .filter((g) => g.units.length);

  return (
    <div className="unit-list">
      {groups.map((g) => (
        <section key={g.category}>
          <h4 className="ul-heading">
            <span className="ul-swatch" style={{ background: CATEGORIES[g.category].color }} />
            {g.category}
          </h4>
          <div className="ul-grid">
            {g.units.map((u) => {
              const state = stateOf(u);
              const price = priceOf(u);
              const disabled = state === 'taken' || state === 'inactive';
              return (
                <button
                  key={u.id}
                  type="button"
                  className={`ul-card is-${state}`}
                  onClick={() => !disabled && onToggle(u)}
                  disabled={disabled}
                  aria-pressed={state === 'selected'}
                >
                  <span className="ul-top">
                    <strong>{u.name}</strong>
                    <span className={`ul-badge is-${state}`}>{badge[state]}</span>
                  </span>
                  {u.sleeps && <span className="ul-sleeps">Sleeps {u.sleeps}</span>}
                  <span className="ul-desc">{u.description}</span>
                  <span className="ul-price">
                    {price !== null ? (
                      <>
                        {formatRand(price)} <small>for your stay</small>
                      </>
                    ) : (
                      <>
                        {formatRand(u.rate_cents)} <small>per night</small>
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

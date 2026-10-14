import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { accommodationTitle, units, type Resort } from '../content';
import { Bed, Home, Tent, Wave } from './Icons';
import { BOOK_UNIT_EVENT } from '../booking/BookingWidget';

gsap.registerPlugin(Flip);

type Filter = 'All' | Resort;
const filters: Filter[] = ['All', 'Paindane', 'Pleasure Bay'];

const iconFor = (category: string) => {
  if (category === 'Camping') return <Tent width={22} height={22} />;
  if (category === 'Units') return <Wave width={22} height={22} />;
  if (category === 'Rondavels' || category === 'Chalets') return <Home width={22} height={22} />;
  return <Bed width={22} height={22} />;
};

export default function Accommodation() {
  const [filter, setFilter] = useState<Filter>('All');
  const [category, setCategory] = useState('All');
  const gridRef = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const categories = useMemo(() => {
    const list = units.filter((u) => filter === 'All' || u.resort === filter).map((u) => u.category);
    return ['All', ...Array.from(new Set(list))];
  }, [filter]);

  const visible = units.filter((u) => (filter === 'All' || u.resort === filter) && (category === 'All' || u.category === category));

  const capture = () => {
    if (gridRef.current) flipState.current = Flip.getState(gridRef.current.querySelectorAll('.unit'));
  };

  // Animate cards from their previous layout to the new one
  useLayoutEffect(() => {
    if (!flipState.current) return;
    Flip.from(flipState.current, {
      duration: 0.7,
      ease: 'power3.inOut',
      absolute: true,
      stagger: 0.02,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power3.out' }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.85, duration: 0.4 }),
    });
    flipState.current = null;
  }, [filter, category]);

  return (
    <div className="container">
      <h2 className="section-title" data-split>
        {accommodationTitle}
      </h2>

      <div className="filters sr-up">
        <div className="filter-row" role="tablist" aria-label="Resort">
          {filters.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              className={`pill ${filter === f ? 'active' : ''}`}
              onClick={() => {
                capture();
                setFilter(f);
                setCategory('All');
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="filter-row filter-row--small" aria-label="Type">
          {categories.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? 'active' : ''}`}
              onClick={() => {
                capture();
                setCategory(c);
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <ul className="units" ref={gridRef}>
        {visible.map((u) => (
          <li key={u.name} className="unit sr-up" data-flip-id={u.name}>
            <div className="unit-top">
              <span className="unit-icon">{iconFor(u.category)}</span>
              <span className="unit-cat">{u.category}</span>
              <span className="unit-resort">{u.resort}</span>
            </div>
            <h3>{u.name}</h3>
            {u.details.map((d) => (
              <p key={d} className={d.startsWith('NOT SUPPLIED') ? 'unit-note' : ''}>
                {d}
              </p>
            ))}
            <a
              href="#book"
              className="unit-link"
              onClick={() => window.dispatchEvent(new CustomEvent(BOOK_UNIT_EVENT, { detail: u.name }))}
            >
              Book Now →
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

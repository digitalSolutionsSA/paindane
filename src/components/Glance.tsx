import { glanceStats } from '../content';

/** Paindane at a glance: a wave line draws itself across, then the numbers count up and pop in. */
export default function Glance() {
  return (
    <div className="glance container">
      <svg className="glance-rule" data-draw viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="glance-rule" x1="0" x2="1">
            <stop offset="0" stopColor="#ffc21a" />
            <stop offset="0.5" stopColor="#ff8a1f" />
            <stop offset="1" stopColor="#19a8e0" />
          </linearGradient>
        </defs>
        <path
          d="M0 20 C80 4 160 36 250 20 S420 4 500 20 S670 36 750 20 S920 4 1000 20"
          fill="none"
          stroke="url(#glance-rule)"
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <dl className="glance-grid" data-pop>
        {glanceStats.map((s) => (
          <div key={s.label} className="glance-item">
            <dt>{s.label}</dt>
            <dd>
              <span data-count={s.value} data-suffix={s.suffix}>
                {s.value}
                {s.suffix}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

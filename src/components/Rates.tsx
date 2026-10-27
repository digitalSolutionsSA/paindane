import { useState } from 'react';
import { rates, ratesSection, type Rate, type Resort } from '../content';
import EnquiryNotice from './EnquiryNotice';

const resorts = Object.keys(rates) as Resort[];

/** 2026 price lists for both resorts, one resort at a time. */
export default function Rates() {
  const [resort, setResort] = useState<Resort>('Paindane');
  // Groups only animate in after the visitor switches resort (the first view uses the scroll reveal)
  const [switched, setSwitched] = useState(false);

  return (
    <div className="container">
      <div className="rates-head">
        <span className="eyebrow">{ratesSection.eyebrow}</span>
        <h2 className="section-title" data-split>
          {ratesSection.title}
        </h2>
        <p className="rates-intro">{ratesSection.intro}</p>
      </div>

      <EnquiryNotice className="sr-up" />

      <div className="filter-row rates-tabs" role="tablist" aria-label="Resort">
        {resorts.map((r) => (
          <button
            key={r}
            role="tab"
            aria-selected={resort === r}
            className={`pill ${resort === r ? 'active' : ''}`}
            onClick={() => {
              setResort(r);
              setSwitched(true);
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <div className={`rate-groups ${switched ? 'is-switched' : ''}`} key={resort} role="tabpanel" aria-label={`${resort} prices`}>
        {rates[resort].map((g) => (
          <section key={g.title} className={`rate-group ${switched ? '' : 'sr-up'}`}>
            <header className="rate-group-head">
              <h3>{g.title}</h3>
              {g.subtitle && <p>{g.subtitle}</p>}
            </header>
            <table className="rate-table">
              <thead>
                <tr>
                  <th scope="col">Accommodation</th>
                  <th scope="col">Season</th>
                  <th scope="col">Peak Season</th>
                </tr>
              </thead>
              <tbody>
                {g.rates.map((r, i) => (
                  <RateRow key={`${r.name}-${i}`} rate={r} />
                ))}
              </tbody>
            </table>
            {g.notes && (
              <div className="rate-notes">
                {g.notes.map((n) => (
                  <p key={n} className={n.startsWith('NOT SUPPLIED') ? 'unit-note' : ''}>
                    {n}
                  </p>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

const onEnquiry = <span className="rate-enquire">On enquiry</span>;

function RateRow({ rate: r }: { rate: Rate }) {
  return (
    <tr>
      <th scope="row">
        <strong>{r.name}</strong>
        {r.units && <span className="rate-units">{r.units}</span>}
        {r.description?.map((d) => (
          <span key={d} className="rate-desc">
            {d}
          </span>
        ))}
      </th>
      {r.price ? (
        <td colSpan={2} className="rate-price rate-price--flat" data-label="Per day">
          {r.price}
        </td>
      ) : (
        <>
          <td className="rate-price" data-label="Season">
            {r.season ?? onEnquiry}
          </td>
          <td className="rate-price rate-price--peak" data-label="Peak Season">
            {r.peak ?? onEnquiry}
          </td>
        </>
      )}
    </tr>
  );
}

import { brand, contact, footer, nav } from '../content';
import { Facebook, Instagram, Mail, Phone, Pin, WhatsApp } from './Icons';
import { logoUrl } from './Picture';

export default function Footer({ base = '' }: { base?: string }) {
  return (
    <>
    <footer className="footer">
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track" data-marquee>
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k}>
              {['Paindane', 'Pleasure Bay', 'Inhambane', 'Mozambique', 'Lighthouse Reef', 'Scuba Diving', 'Fishing', 'Sea Safaris'].map((w) => (
                <em key={w}>{w} ✦ </em>
              ))}
            </span>
          ))}
        </div>
      </div>
      <div className="container footer-grid">
        <div className="footer-logo sr-up">
          <img src={logoUrl()} alt={brand.name} width={691} height={304} loading="lazy" decoding="async" />
        </div>
        <div className="sr-up">
          <ul className="quick-links">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`${base}#${n.id}`}>{n.label}</a>
              </li>
            ))}
          </ul>
          <div className="socials">
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"><WhatsApp /></a>
            <a href={contact.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook /></a>
            <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram /></a>
          </div>
        </div>
        <div className="footer-contact sr-up">
          <h4>Paindane</h4>
          <a href={contact.phoneHref}><Phone width={16} height={16} /> {contact.phone}</a>
          <a href={`mailto:${contact.email}`}><Mail width={16} height={16} /> {contact.email}</a>
          <a href={contact.mapsLink} target="_blank" rel="noreferrer"><Pin width={16} height={16} /> {contact.address}</a>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>{footer.copyright}</span>
          <span>
            <a href={footer.privacy}>Privacy Policy</a> |{' '}
            <a href={footer.disclaimer}>Disclaimer</a>
          </span>
        </div>
      </div>
    </footer>
      <a className="whatsapp-float" href={contact.whatsapp} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
        <WhatsApp width={30} height={30} />
      </a>
    </>
  );
}

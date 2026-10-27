import { contact, enquiryNotice } from '../content';
import { Mail, Phone, WhatsApp } from './Icons';

/** "Enquire before you book" banner with direct ways to reach management. */
export default function EnquiryNotice({ className = '' }: { className?: string }) {
  return (
    <aside className={`enquiry ${className}`} role="note" aria-label={enquiryNotice.title}>
      <div className="enquiry-badge" aria-hidden="true">!</div>
      <div className="enquiry-text">
        <h3>{enquiryNotice.title}</h3>
        <p>{enquiryNotice.body}</p>
      </div>
      <div className="enquiry-actions">
        <a className="enquiry-btn enquiry-btn--wa" href={contact.whatsapp} target="_blank" rel="noreferrer">
          <WhatsApp width={18} height={18} /> WhatsApp
        </a>
        <a className="enquiry-btn" href={`mailto:${contact.email}?subject=${encodeURIComponent('Booking enquiry')}`}>
          <Mail width={18} height={18} /> Email
        </a>
        <a className="enquiry-btn" href={contact.phoneHref}>
          <Phone width={18} height={18} /> Call
        </a>
      </div>
    </aside>
  );
}

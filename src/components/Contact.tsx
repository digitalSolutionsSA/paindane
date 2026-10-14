import { contact, contactSection } from '../content';
import BookingWidget from '../booking/BookingWidget';
import { Mail, Phone, Pin } from './Icons';
import Picture from './Picture';

export default function Contact() {
  return (
    <>
      <div className="cta-band">
        <div className="cta-bg" data-parallax>
          <Picture src="/images/hero/hero-2.jpg" alt="" sizes="100vw" />
        </div>
        <h2 className="cta-title" data-split>
          {contactSection.cta}
        </h2>
      </div>

      <div className="container">
        <BookingWidget />
      </div>

      <div className="container contact-wrap">
        <div className="contact-info sr-left">
          <h2 data-split>{contactSection.title}</h2>
          <a className="info-row" href={contact.phoneHref}>
            <span className="info-icon"><Phone /></span>
            <span>
              <small>Phone</small>
              {contact.phone}
            </span>
          </a>
          <a className="info-row" href={`mailto:${contact.email}`}>
            <span className="info-icon"><Mail /></span>
            <span>
              <small>Email</small>
              {contact.email}
            </span>
          </a>
          <a className="info-row" href={contact.mapsLink} target="_blank" rel="noreferrer">
            <span className="info-icon"><Pin /></span>
            <span>
              <small>Address</small>
              {contact.address}
            </span>
          </a>
        </div>
        <div className="map sr-right">
          <iframe
            title="Map of Paindane"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${contact.lat},${contact.lng}&z=12&output=embed`}
          />
        </div>
      </div>
    </>
  );
}

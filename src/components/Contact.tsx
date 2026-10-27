import { contact, contactSection } from '../content';
import EnquiryForm from './EnquiryForm';
import EnquiryNotice from './EnquiryNotice';
import { Mail, Phone, Pin } from './Icons';
import SunPortal from './SunPortal';

export default function Contact() {
  return (
    <>
      <SunPortal />

      <div className="container">
        <EnquiryNotice className="enquiry--contact sr-up" />
        <EnquiryForm />
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
        <div className="map" data-clip>
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

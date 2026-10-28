import { useEffect, useState } from 'react';
import { brand, contact, nav } from '../content';
import { Close, Mail, Menu, Phone } from './Icons';
import { Logo } from './Picture';

/** `base` prefixes the section links, e.g. "/" on pages other than the home page. */
export default function Header({ base = '' }: { base?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      setHidden(y > 400 && y > last);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight the section in view
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    nav.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
  }, [open]);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${hidden && !open ? 'is-hidden' : ''}`}>
      <div className="topbar">
        <div className="container topbar-inner">
          <a href={`mailto:${contact.email}`} aria-label="Email">
            <Mail width={16} height={16} /> <span className="hide-sm">{contact.email}</span>
          </a>
          <a href={contact.phoneHref} aria-label="Phone">
            <Phone width={16} height={16} /> <span>{contact.phone}</span>
          </a>
        </div>
      </div>
      <div className="navbar">
        <div className="container navbar-inner">
          <a href={`${base}#top`} className="logo" aria-label={brand.name}>
            <Logo sizes="190px" alt={brand.name} {...({ fetchpriority: 'high' } as Record<string, string>)} />
          </a>
          <nav className={`nav ${open ? 'is-open' : ''}`} aria-label="Main">
            {nav.map((n) => (
              <a
                key={n.id}
                href={n.href ?? `${base}#${n.id}`}
                className={`${active === n.id ? 'active' : ''} ${n.id === 'contact' ? 'nav-cta' : ''}`}
                onClick={() => setOpen(false)}
              >
                {n.label}
              </a>
            ))}
          </nav>
          <button className="menu-toggle" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <Close width={28} height={28} /> : <Menu width={28} height={28} />}
          </button>
        </div>
      </div>
      <div className="progress-bar" />
    </header>
  );
}

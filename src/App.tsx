import { useCallback, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Explore from './components/Explore';
import Glance from './components/Glance';
import HowBooking from './components/HowBooking';
import VelocityBand from './components/VelocityBand';
import GalleryStrip from './components/GalleryStrip';
import Accommodation from './components/Accommodation';
import Contact from './components/Contact';
import Cursor from './components/Cursor';
import { Sun, WaveDivider } from './components/Decor';
import Footer from './components/Footer';
import Lightbox from './components/Lightbox';
import Preloader from './components/Preloader';
import { gallery, galleryPage, welcome } from './content';
import { useButtonFlood } from './hooks/useButtonFlood';
import { useGsapEffects } from './hooks/useGsapEffects';
import { useScrollReveal } from './hooks/useScrollReveal';
import { useSmoothScroll } from './lib/smoothScroll';

export default function App() {
  const [lb, setLb] = useState<{ images: string[]; index: number | null }>({ images: gallery, index: null });

  useSmoothScroll();
  useGsapEffects();
  useButtonFlood();
  useScrollReveal();

  const openSingle = useCallback((src: string) => {
    const i = gallery.indexOf(src);
    setLb(i >= 0 ? { images: gallery, index: i } : { images: [src], index: 0 });
  }, []);
  const openGallery = useCallback((index: number) => setLb({ images: gallery, index }), []);
  const setIndex = useCallback((index: number | null) => setLb((s) => ({ ...s, index })), []);

  return (
    <>
      <Preloader />
      <Cursor />
      <Header />
      <main className="site-main">
        <Hero />

        <section id="welcome" className="section section--welcome">
          <div className="bg-word" data-drift="1" aria-hidden="true">
            Mozambique
          </div>
          <Sun className="sun--welcome" />
          <div className="container narrow intro">
            <span className="eyebrow">Welcome</span>
            <h2 className="intro-title" data-split>{welcome.title}</h2>
            {welcome.paragraphs.map((p) => (
              <p key={p} className="lead" data-scrub-text>
                {p}
              </p>
            ))}
            <p className="highlight sr-zoom">
              <strong>{welcome.highlight}</strong>
            </p>
          </div>
          <Glance />
          <WaveDivider color="var(--sand-light)" />
        </section>

        <section id="explore" className="section section--sand section--explore">
          <div className="bg-word" data-drift="-1" aria-hidden="true">
            Paindane
          </div>
          <Explore onOpenImage={openSingle} />
          <WaveDivider color="var(--navy-deep)" />
        </section>

        <section id="gallery" className="section section--dark section--gallery">
          <VelocityBand />
          <GalleryStrip onOpen={openGallery} />
          <div className="container gallery-more sr-up">
            <a href={galleryPage.href} className="btn btn-sand">
              View the full gallery ({gallery.length} photos)
            </a>
          </div>
          <WaveDivider color="var(--aqua-light)" />
        </section>

        <section id="accommodation" className="section section--grey">
          <Sun className="sun--accommodation" />
          <Accommodation />
          <WaveDivider color="var(--navy-deep)" />
        </section>

        <section id="how" className="section section--dark section--how">
          <HowBooking />
        </section>

        <section id="contact" className="section section--contact">
          <Contact />
        </section>
      </main>
      <Footer />
      <Lightbox images={lb.images} index={lb.index} onChange={setIndex} />
    </>
  );
}

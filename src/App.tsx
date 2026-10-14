import { useCallback, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeatureBlock from './components/FeatureBlock';
import Gallery from './components/Gallery';
import GalleryStrip from './components/GalleryStrip';
import Accommodation from './components/Accommodation';
import Contact from './components/Contact';
import Cursor from './components/Cursor';
import Footer from './components/Footer';
import Lightbox from './components/Lightbox';
import Preloader from './components/Preloader';
import { gallery, paindaneFeatures, pleasureBayFeatures, welcome, welcomeFeatures } from './content';
import { useGsapEffects } from './hooks/useGsapEffects';
import { useScrollReveal } from './hooks/useScrollReveal';
import { useSmoothScroll } from './lib/smoothScroll';

export default function App() {
  const [lb, setLb] = useState<{ images: string[]; index: number | null }>({ images: gallery, index: null });

  useSmoothScroll();
  useGsapEffects();
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
          <div className="container narrow intro">
            <span className="eyebrow">Welcome</span>
            <h1 data-split>{welcome.title}</h1>
            {welcome.paragraphs.map((p) => (
              <p key={p} className="lead" data-scrub-text>
                {p}
              </p>
            ))}
            <p className="highlight sr-zoom">
              <strong>{welcome.highlight}</strong>
            </p>
          </div>
          <div className="features">
            {welcomeFeatures.map((f, i) => (
              <FeatureBlock key={i} feature={f} onOpenImage={openSingle} />
            ))}
          </div>
        </section>

        <section id="paindane" className="section section--sand">
          <div className="bg-word" data-drift="-1" aria-hidden="true">
            Paindane
          </div>
          <div className="section-head container">
            <span className="eyebrow">Paindane Beach Resort</span>
          </div>
          <div className="features">
            {paindaneFeatures.map((f, i) => (
              <FeatureBlock key={i} feature={f} onOpenImage={openSingle} />
            ))}
          </div>
        </section>

        <section id="pleasure-bay" className="section">
          <div className="bg-word" data-drift="1" aria-hidden="true">
            Pleasure Bay
          </div>
          <div className="section-head container">
            <span className="eyebrow">Pleasure Bay Resort</span>
          </div>
          <div className="features">
            {pleasureBayFeatures.map((f, i) => (
              <FeatureBlock key={i} feature={f} onOpenImage={openSingle} />
            ))}
          </div>
        </section>

        <section id="gallery" className="section section--dark section--gallery">
          <GalleryStrip onOpen={openGallery} />
          <div className="container">
            <Gallery onOpen={openGallery} />
          </div>
        </section>

        <section id="accommodation" className="section section--grey">
          <Accommodation />
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

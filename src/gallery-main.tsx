import { StrictMode, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Header from './components/Header';
import Footer from './components/Footer';
import GalleryPage from './components/GalleryPage';
import Lightbox from './components/Lightbox';
import Cursor from './components/Cursor';
import { gallery } from './content';
import { useSmoothScroll } from './lib/smoothScroll';
import { useButtonFlood } from './hooks/useButtonFlood';
import { useGsapEffects } from './hooks/useGsapEffects';
import { useScrollReveal } from './hooks/useScrollReveal';
import './styles.css';
import './motion.css';

function GalleryApp() {
  const [index, setIndex] = useState<number | null>(null);
  const open = useCallback((i: number) => setIndex(i), []);

  useSmoothScroll();
  useGsapEffects();
  useScrollReveal();
  useButtonFlood();

  return (
    <>
      <Cursor />
      <Header base="/" />
      <main className="site-main">
        <GalleryPage onOpen={open} />
      </main>
      <Footer base="/" />
      <Lightbox images={gallery} index={index} onChange={setIndex} />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GalleryApp />
  </StrictMode>,
);

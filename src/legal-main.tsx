import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Header from './components/Header';
import Footer from './components/Footer';
import LegalPage from './components/LegalPage';
import Cursor from './components/Cursor';
import { useSmoothScroll } from './lib/smoothScroll';
import { disclaimer, privacy } from './legal';
import { useGsapEffects } from './hooks/useGsapEffects';
import { useScrollReveal } from './hooks/useScrollReveal';
import './styles.css';
import './motion.css';

const pages = {
  privacy: { title: 'Privacy Policy', eyebrow: 'Tan ‘n Biki', image: '/images/hero/hero-3.jpg', sections: privacy },
  disclaimer: { title: 'Disclaimer', eyebrow: 'Tan ‘n Biki', image: '/images/hero/hero-4.jpg', sections: disclaimer },
};

const rootEl = document.getElementById('root')!;
const page = pages[rootEl.dataset.page as keyof typeof pages];

function Legal() {
  useSmoothScroll();
  useGsapEffects();
  useScrollReveal();
  return (
    <>
      <Cursor />
      <Header base="/" />
      <main className="site-main">
        <LegalPage {...page} />
      </main>
      <Footer base="/" />
    </>
  );
}

createRoot(rootEl).render(
  <StrictMode>
    <Legal />
  </StrictMode>,
);

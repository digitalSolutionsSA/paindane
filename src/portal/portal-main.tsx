import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Portal from './Portal';
import '../styles.css';
import '../booking/booking.css';
import './portal.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Portal />
  </StrictMode>,
);

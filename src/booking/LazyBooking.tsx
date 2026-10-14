import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { LOAD_BOOKING_EVENT } from './bookEvents';

const BookingWidget = lazy(() => import('./BookingWidget'));

/**
 * Loads the booking widget (and Supabase, the site map, dates…) only when the visitor gets near it,
 * or straight away when they press a "Book Now" link. Keeps the first page load light.
 */
export default function LazyBooking() {
  const holder = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (load) return;
    const go = () => setLoad(true);
    window.addEventListener(LOAD_BOOKING_EVENT, go);
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && go(), { rootMargin: '1400px 0px' });
    if (holder.current) io.observe(holder.current);
    // Fetch it anyway once the page is idle, so it's ready by the time anyone scrolls down
    const idle = window.setTimeout(go, 6000);
    return () => {
      window.removeEventListener(LOAD_BOOKING_EVENT, go);
      io.disconnect();
      window.clearTimeout(idle);
    };
  }, [load]);

  return (
    <div id="book" ref={holder} className="booking-holder">
      {load ? (
        <Suspense fallback={<BookingSkeleton />}>
          <BookingWidget />
        </Suspense>
      ) : (
        <BookingSkeleton />
      )}
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="booking booking-skeleton" aria-busy="true" aria-label="Loading the booking form">
      <div className="sk sk-title" />
      <div className="sk sk-bar" />
      <div className="sk sk-map" />
    </div>
  );
}

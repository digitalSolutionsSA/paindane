// Tiny module (no booking code) so other parts of the page can talk to the booking widget before it
// has been downloaded.

/** The widget listens for this to open on a unit (detail: the unit's listing name) */
export const BOOK_UNIT_EVENT = 'paindane:book-unit';
/** Asks the lazy loader to fetch the widget now */
export const LOAD_BOOKING_EVENT = 'paindane:load-booking';

let pending: string | null = null;

/** Opens the booking widget on a unit, loading the widget first if needed */
export function requestBook(listing: string) {
  pending = listing;
  window.dispatchEvent(new Event(LOAD_BOOKING_EVENT));
  window.dispatchEvent(new CustomEvent(BOOK_UNIT_EVENT, { detail: listing }));
}

/** The widget calls this when it mounts, to pick up a request made while it was loading */
export function takePendingBook() {
  const p = pending;
  pending = null;
  return p;
}

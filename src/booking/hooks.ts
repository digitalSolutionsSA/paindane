import { useCallback, useEffect, useState } from 'react';
import { fetchPeakPeriods, fetchUnavailable, fetchUnits, type PeakPeriod, type Unit } from './api';

/** Units (with live rates) and peak periods, loaded once */
export function useUnitsAndRates(reloadKey = 0) {
  const [units, setUnits] = useState<Unit[] | null>(null);
  const [peaks, setPeaks] = useState<PeakPeriod[]>([]);
  useEffect(() => {
    let live = true;
    Promise.all([fetchUnits(), fetchPeakPeriods()]).then(([u, p]) => {
      if (!live) return;
      setUnits(u);
      setPeaks(p);
    });
    return () => {
      live = false;
    };
  }, [reloadKey]);
  return { units, peaks };
}

const REFRESH_MS = 20_000;

/** Units booked or held for the chosen dates, refreshed every 20s and when the tab regains focus */
export function useAvailability(checkIn: string, checkOut: string) {
  const [unavailable, setUnavailable] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(false);
  const ready = Boolean(checkIn && checkOut && checkOut > checkIn);

  const refresh = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    try {
      setUnavailable(new Set(await fetchUnavailable(checkIn, checkOut)));
    } catch {
      // Keep the last known state; the database re-checks every unit when the request is sent
    } finally {
      setLoading(false);
    }
  }, [checkIn, checkOut, ready]);

  useEffect(() => {
    setUnavailable(new Set());
    if (!ready) return;
    refresh();
    const timer = window.setInterval(refresh, REFRESH_MS);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh, ready]);

  /** Mark units taken straight away (e.g. when a request reports they were just booked) */
  const markTaken = useCallback((ids: string[]) => setUnavailable((prev) => new Set([...prev, ...ids])), []);

  return { unavailable, loading, ready, refresh, markTaken };
}

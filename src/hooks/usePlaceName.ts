import { useState, useEffect } from 'react';
import { getPlaceName } from '../utils/geocode';
import type { Location } from '../types';

export const usePlaceName = (location: Location | null | undefined) => {
  const [placeName, setPlaceName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location) {
      setPlaceName('');
      return;
    }

    let cancelled = false;

    setLoading(true);
    setPlaceName('');

    getPlaceName(location.lat, location.lng)
      .then((name) => {
        if (!cancelled) setPlaceName(name);
      })
      .catch(() => {
        if (!cancelled) {
          setPlaceName(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Cleanup — prevents stale state if location changes mid-fetch
    return () => { cancelled = true; };

  }, [location?.lat, location?.lng]);

  return { placeName, loading };
};
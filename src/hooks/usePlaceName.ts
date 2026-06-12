import { useState, useEffect } from 'react';
import { getPlaceName } from '../utils/geocode';
import  type { Location } from '../types';

export const usePlaceName = (location: Location | null | undefined) => {
  const [placeName, setPlaceName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location) return;

    setLoading(true);
    getPlaceName(location.lat, location.lng)
      .then(setPlaceName)
      .finally(() => setLoading(false));
  }, [location?.lat, location?.lng]);

  return { placeName, loading };
};
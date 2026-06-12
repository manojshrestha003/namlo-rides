// Cache — same coords never fetch twice
const cache = new Map<string, string>();

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

let lastRequestTime = 0; // track last fetch time

export const getPlaceName = async (
  lat: number,
  lng: number
): Promise<string> => {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;

  // ✅ Return from cache instantly — no network call
  if (cache.has(key)) return cache.get(key)!;

  try {
    // ✅ Enforce 1.2s gap between requests
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < 1200) {
      await delay(1200 - timeSinceLast);
    }
    lastRequestTime = Date.now();

    const res = await fetch(
      `/api/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'namlo-rides-app',
        },
      }
    );

    if (!res.ok) throw new Error(`Status ${res.status}`);

    const data = await res.json();
    const { road, suburb, neighbourhood, city, town, county } = data.address;
    const name =
      road || suburb || neighbourhood || city || town || county || data.display_name;

    // ✅ Save to cache
    cache.set(key, name);
    return name;

  } catch {
    // Fallback to coordinates if anything fails
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};
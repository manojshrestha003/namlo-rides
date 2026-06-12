export const getPlaceName = async (
  lat: number,
  lng: number
): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'Accept-Language': 'en', // always return English names
        },
      }
    );
    const data = await res.json();

    // Try to get the most readable short name
    const { road, suburb, neighbourhood, city, town, county } = data.address;
    return road || suburb || neighbourhood || city || town || county || data.display_name;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`; // fallback to coords
  }
};
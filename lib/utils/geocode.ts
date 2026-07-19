// Geocodes a free-text place name using OpenStreetMap's Nominatim (free,
// no API key). We proxy this server-side (see app/api/geocode/route.ts) so we
// can set a proper User-Agent and avoid CORS issues on the client.

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function geocodeCity(city: string): Promise<GeocodeResult | null> {
  const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(city)}`;

  const res = await fetch(url, {
    headers: {
      // Nominatim's usage policy requires a descriptive User-Agent.
      "User-Agent": "NakshatraApp/1.0 (https://nakshatra.app)",
    },
    next: { revalidate: 60 * 60 * 24 * 30 }, // city coordinates don't change; cache 30d
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  if (!data.length) return null;

  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/** Italia approssimata (bbox) — usata solo se PRICING_ENFORCE_GEO=true. */
export function isWithinItaly(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return false;
  }
  return lat >= 35.5 && lat <= 47.5 && lng >= 6.5 && lng <= 18.8;
}

export function isGeoFenceEnabled(): boolean {
  return process.env.PRICING_ENFORCE_GEO === "true";
}

export function parseLatLngString(text: string): { lat: number; lng: number } | null {
  const trimmed = text.trim();
  const m = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) {
    return null;
  }
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }
  return { lat, lng };
}

export async function resolveLatLngForPricing(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const parsed = parseLatLngString(address);
    if (parsed) {
      return parsed;
    }

    const key =
      process.env.GOOGLE_MAPS_API_KEY ??
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (key) {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?${new URLSearchParams({
        address: address.trim(),
        key,
      })}`;

      const response = await fetch(url, { method: "GET", cache: "no-store" });
      if (response.ok) {
        const payload = (await response.json()) as {
          results?: Array<{ geometry?: { location?: { lat?: number; lng?: number } } }>;
        };

        const loc = payload.results?.[0]?.geometry?.location;
        const lat = loc?.lat;
        const lng = loc?.lng;
        if (typeof lat === "number" && typeof lng === "number") {
          return { lat, lng };
        }
      }
    }

    return await resolveViaNominatim(address);
  } catch {
    return null;
  }
}

async function resolveViaNominatim(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      q: address.trim(),
      format: "json",
      limit: "1",
      countrycodes: "it",
    })}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent": "mychauffeur-new/1.0 (pricing; contact: info@mychauffeur.it)",
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Array<{ lat?: string; lon?: string }>;
    const row = payload?.[0];
    if (!row) {
      return null;
    }

    const lat = Number(row.lat);
    const lng = Number(row.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return { lat, lng };
  } catch {
    return null;
  }
}

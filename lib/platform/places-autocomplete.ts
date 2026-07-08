export type PlaceSuggestion = {
  placeId: string;
  label: string;
  mainText: string;
  secondaryText: string;
};

export type PlaceDetails = {
  placeId: string;
  address: string;
  lat: number;
  lng: number;
};

function getServerMapsKey(): string | null {
  return (
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    null
  );
}

function normalizePlaceId(raw: string): string {
  return raw.startsWith("places/") ? raw.slice("places/".length) : raw;
}

export async function fetchPlaceSuggestions(
  input: string,
  languageCode = "it"
): Promise<{ ok: true; suggestions: PlaceSuggestion[] } | { ok: false; error: string }> {
  const key = getServerMapsKey();
  const query = input.trim();
  if (!key) {
    return { ok: false, error: "Google Maps API key not configured." };
  }
  if (query.length < 2) {
    return { ok: true, suggestions: [] };
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
      },
      body: JSON.stringify({
        input: query,
        includedRegionCodes: ["it"],
        languageCode,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        ok: false,
        error: `Places autocomplete failed (${res.status}): ${body.slice(0, 200)}`,
      };
    }

    const payload = (await res.json()) as {
      suggestions?: Array<{
        placePrediction?: {
          place?: string;
          placeId?: string;
          text?: { text?: string };
          structuredFormat?: {
            mainText?: { text?: string };
            secondaryText?: { text?: string };
          };
        };
      }>;
    };

    const suggestions: PlaceSuggestion[] = [];
    for (const item of payload.suggestions ?? []) {
      const prediction = item.placePrediction;
      if (!prediction) continue;

      const placeId = normalizePlaceId(prediction.placeId ?? prediction.place ?? "");
      if (!placeId) continue;

      const mainText = prediction.structuredFormat?.mainText?.text ?? "";
      const secondaryText = prediction.structuredFormat?.secondaryText?.text ?? "";
      const label = prediction.text?.text ?? [mainText, secondaryText].filter(Boolean).join(", ");

      suggestions.push({
        placeId,
        label,
        mainText: mainText || label,
        secondaryText,
      });
    }

    return { ok: true, suggestions };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Places autocomplete failed.",
    };
  }
}

export async function fetchPlaceDetails(
  placeId: string,
  languageCode = "it"
): Promise<{ ok: true; data: PlaceDetails } | { ok: false; error: string }> {
  const key = getServerMapsKey();
  const id = normalizePlaceId(placeId.trim());
  if (!key) {
    return { ok: false, error: "Google Maps API key not configured." };
  }
  if (!id) {
    return { ok: false, error: "placeId required." };
  }

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "id,formattedAddress,location,displayName",
        "Accept-Language": languageCode,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        ok: false,
        error: `Place details failed (${res.status}): ${body.slice(0, 200)}`,
      };
    }

    const payload = (await res.json()) as {
      id?: string;
      formattedAddress?: string;
      displayName?: { text?: string };
      location?: { latitude?: number; longitude?: number };
    };

    const lat = payload.location?.latitude;
    const lng = payload.location?.longitude;
    if (lat == null || lng == null) {
      return { ok: false, error: "Coordinate non disponibili per questo luogo." };
    }

    return {
      ok: true,
      data: {
        placeId: normalizePlaceId(payload.id ?? id),
        address: payload.formattedAddress ?? payload.displayName?.text ?? id,
        lat,
        lng,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Place details failed.",
    };
  }
}

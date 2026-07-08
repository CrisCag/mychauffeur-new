const GOOGLE_MAPS_SCRIPT_ID = "google-maps-platform-script";

export type GooglePlaceResult = {
  formatted_address?: string;
  name?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
};

export type GoogleMapsApi = {
  importLibrary: (name: string) => Promise<unknown>;
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown;
  LatLngBounds: new () => { extend: (p: { lat: number; lng: number }) => void };
  Marker: new (opts: Record<string, unknown>) => { setMap: (m: unknown) => void };
  Polyline: new (opts: Record<string, unknown>) => { setMap: (m: unknown) => void };
  SymbolPath: { CIRCLE: unknown };
};

export type PlaceAutocompleteElementInstance = HTMLElement & {
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  addEventListener: (
    type: "gmp-select" | "input",
    listener: (event: PlacePredictionSelectEvent) => void
  ) => void;
};

export type PlacePredictionSelectEvent = {
  placePrediction: {
    toPlace: () => PlaceInstance;
  };
};

export type PlaceInstance = {
  fetchFields: (opts: { fields: string[] }) => Promise<void>;
  formattedAddress?: string;
  displayName?: string;
  location?: { lat: () => number; lng: () => number };
};

export type PlacesLibrary = {
  PlaceAutocompleteElement: new (opts?: {
    placeholder?: string;
    includedRegionCodes?: string[];
  }) => PlaceAutocompleteElementInstance;
};

declare global {
  interface Window {
    google?: {
      maps?: GoogleMapsApi;
    };
  }
}

let loadPromise: Promise<void> | null = null;

export function getGoogleMapsApiKey(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
}

/** Carica Maps JS (async) per importLibrary + mappa. */
export function loadGoogleMapsPlacesScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.google?.maps?.importLibrary) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Maps script failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async&v=weekly`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps script failed"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export async function importPlacesLibrary(apiKey: string): Promise<PlacesLibrary> {
  await loadGoogleMapsPlacesScript(apiKey);
  const maps = window.google?.maps;
  if (!maps?.importLibrary) {
    throw new Error("Google Maps importLibrary unavailable");
  }
  return maps.importLibrary("places") as Promise<PlacesLibrary>;
}

export function getPlaceAddressFromNewPlace(
  place: PlaceInstance,
  fallback = ""
): string {
  return (place.formattedAddress ?? place.displayName ?? fallback).trim();
}

export function getPlaceLatLngFromNewPlace(
  place: PlaceInstance
): { lat: number; lng: number } | null {
  const lat = place.location?.lat();
  const lng = place.location?.lng();
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }
  return { lat, lng };
}

/** @deprecated Legacy Places — usare getPlaceAddressFromNewPlace */
export function getPlaceAddress(place: GooglePlaceResult, fallback = ""): string {
  return (place.formatted_address ?? place.name ?? fallback).trim();
}

/** @deprecated Legacy Places — usare getPlaceLatLngFromNewPlace */
export function getPlaceLatLng(
  place: GooglePlaceResult
): { lat: number; lng: number } | null {
  const lat = place.geometry?.location?.lat();
  const lng = place.geometry?.location?.lng();
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }
  return { lat, lng };
}

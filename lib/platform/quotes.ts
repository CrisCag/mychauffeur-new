import { getSupabaseAdminClient } from "@/lib/platform/supabase-admin";
import type { TripVehicleType } from "@/types/trip";

const DEFAULT_QUOTE_TTL_MS = 24 * 60 * 60 * 1000;

export type QuoteInsert = {
  origin: string;
  destination: string;
  distance_km: number;
  duration_sec: number;
  selected_pois: string[];
  total_price: number;
  vehicle_type: TripVehicleType;
  currency?: string;
  expires_at?: string;
};

type QuoteDbRow = {
  origin: string;
  destination: string;
  distance_km: number;
  duration_sec: number;
  selected_pois: string[];
  total_price: number;
  expires_at: string;
  vehicle_type: TripVehicleType;
  currency: string;
};

function normalizeQuoteInsertToRow(
  data: QuoteInsert,
  defaultExpiresIso: string
): { ok: true; row: QuoteDbRow } | { ok: false; error: string } {
  const origin = data.origin?.trim() ?? "";
  const destination = data.destination?.trim() ?? "";
  if (!origin || !destination) {
    return { ok: false, error: "Partenza e arrivo sono obbligatori." };
  }

  const distance_km = Number(data.distance_km);
  const duration_sec = Math.round(Number(data.duration_sec));
  const total_price = Number(data.total_price);

  if (!Number.isFinite(distance_km) || distance_km < 0) {
    return { ok: false, error: "Distanza non valida." };
  }
  if (!Number.isFinite(duration_sec) || duration_sec < 1) {
    return { ok: false, error: "Durata non valida." };
  }
  if (!Number.isFinite(total_price) || total_price < 0) {
    return { ok: false, error: "Prezzo non valido." };
  }

  const vt = data.vehicle_type;
  if (vt !== "sedan" && vt !== "van" && vt !== "luxury") {
    return { ok: false, error: "Classe veicolo non valida." };
  }

  const stops = Array.isArray(data.selected_pois)
    ? data.selected_pois.filter((id) => typeof id === "string" && id.trim().length > 0)
    : [];

  const expiresAt = data.expires_at?.trim() || defaultExpiresIso;

  return {
    ok: true,
    row: {
      origin,
      destination,
      distance_km,
      duration_sec,
      selected_pois: stops,
      total_price,
      expires_at: expiresAt,
      vehicle_type: vt,
      currency: (data.currency ?? "EUR").trim() || "EUR",
    },
  };
}

export type InsertQuotesBatchResult =
  | { ok: true; idsByVehicle: Record<TripVehicleType, string> }
  | { ok: false; error: string };

export async function insertQuotesBatch(
  rows: QuoteInsert[]
): Promise<InsertQuotesBatchResult> {
  if (rows.length === 0) {
    return { ok: false, error: "Nessun preventivo da salvare." };
  }

  const defaultExpires = new Date(Date.now() + DEFAULT_QUOTE_TTL_MS).toISOString();
  const dbRows: QuoteDbRow[] = [];

  for (const data of rows) {
    const normalized = normalizeQuoteInsertToRow(data, defaultExpires);
    if (!normalized.ok) {
      return { ok: false, error: normalized.error };
    }
    dbRows.push(normalized.row);
  }

  const supabase = getSupabaseAdminClient();

  const { data: inserted, error } = await supabase
    .from("quotes")
    .insert(dbRows)
    .select("id, vehicle_type");

  if (error || !inserted || inserted.length !== dbRows.length) {
    return {
      ok: false,
      error: error?.message ?? "Impossibile salvare i preventivi.",
    };
  }

  const idsByVehicle = {} as Record<TripVehicleType, string>;
  for (const row of inserted) {
    const vt = row.vehicle_type as TripVehicleType;
    idsByVehicle[vt] = row.id as string;
  }

  return { ok: true, idsByVehicle };
}

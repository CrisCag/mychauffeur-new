import type { SupabaseClient } from "@supabase/supabase-js";

export type PoiStopRow = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  base_stop_price: number;
  deviation_time_minutes: number;
  suggested_duration_minutes?: number;
};

export async function fetchPoiStopsByIds(
  supabase: SupabaseClient,
  stopIds: string[]
): Promise<{ data: PoiStopRow[]; error: Error | null }> {
  const full = await supabase
    .from("points_of_interest")
    .select(
      "id,name,lat,lng,base_stop_price,deviation_time_minutes,suggested_duration_minutes"
    )
    .in("id", stopIds);

  if (!full.error && full.data) {
    return { data: full.data as PoiStopRow[], error: null };
  }

  const legacy = await supabase
    .from("points_of_interest")
    .select("id,name,lat,lng,base_stop_price")
    .in("id", stopIds);

  if (legacy.error) {
    return { data: [], error: new Error(legacy.error.message) };
  }

  const normalized: PoiStopRow[] = (legacy.data ?? []).map((row) => ({
    ...(row as PoiStopRow),
    deviation_time_minutes: 0,
    suggested_duration_minutes: 0,
  }));

  return { data: normalized, error: null };
}

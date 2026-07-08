import { suggestStaticPois } from "@/lib/platform/static-pois";
import { tryGetSupabaseAdminClient } from "@/lib/platform/supabase-admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin")?.trim() ?? "";
  const destination = searchParams.get("destination")?.trim() ?? "";

  const supabase = tryGetSupabaseAdminClient();
  if (supabase && origin && destination) {
    const { data, error } = await supabase.from("points_of_interest").select("*").limit(20);
    if (!error && data && data.length > 0) {
      return NextResponse.json({ pointsOfInterest: data }, { status: 200 });
    }
  }

  const pointsOfInterest =
    origin && destination
      ? suggestStaticPois(origin, destination)
      : suggestStaticPois("Italia", "Italia");

  return NextResponse.json({ pointsOfInterest }, { status: 200 });
}

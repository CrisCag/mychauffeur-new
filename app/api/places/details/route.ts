import { fetchPlaceDetails } from "@/lib/platform/places-autocomplete";
import { enforceApiRateLimit } from "@/lib/api/enforce-rate-limit";
import { clientFacingMessage } from "@/lib/api/production-errors";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const rateLimited = enforceApiRateLimit(request, "places", "success");
  if (rateLimited) {
    return rateLimited;
  }

  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId") ?? "";
  const locale = searchParams.get("locale") ?? "it";
  const languageCode = locale.startsWith("en") ? "en" : "it";

  const result = await fetchPlaceDetails(placeId, languageCode);
  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        error: clientFacingMessage(result.error, "Place details lookup failed."),
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    place: result.data,
  });
}

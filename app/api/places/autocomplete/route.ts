import { fetchPlaceSuggestions } from "@/lib/platform/places-autocomplete";
import { enforceApiRateLimit } from "@/lib/api/enforce-rate-limit";
import { clientFacingMessage } from "@/lib/api/production-errors";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const rateLimited = enforceApiRateLimit(request, "places", "success");
  if (rateLimited) {
    return rateLimited;
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const locale = searchParams.get("locale") ?? "it";
  const languageCode = locale.startsWith("en") ? "en" : "it";

  const result = await fetchPlaceSuggestions(q, languageCode);
  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        error: clientFacingMessage(result.error, "Places lookup failed."),
        suggestions: [],
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    suggestions: result.suggestions,
  });
}

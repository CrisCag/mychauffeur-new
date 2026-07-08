import { buildRoutePreview } from "@/lib/platform/route-preview";
import { enforceApiRateLimit } from "@/lib/api/enforce-rate-limit";
import { clientFacingMessage } from "@/lib/api/production-errors";
import type { TripStopInput } from "@/types/trip";
import { NextResponse } from "next/server";

type RoutePreviewPayload = {
  origin?: string;
  destination?: string;
  stops?: TripStopInput[];
};

export async function POST(request: Request) {
  const rateLimited = enforceApiRateLimit(request, "routePreview", "success");
  if (rateLimited) {
    return rateLimited;
  }

  try {
    const body = (await request.json()) as RoutePreviewPayload;
    const result = await buildRoutePreview({
      origin: body.origin?.trim() ?? "",
      destination: body.destination?.trim() ?? "",
      stops: Array.isArray(body.stops) ? body.stops : [],
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          error: clientFacingMessage(result.error, "Unable to build route preview."),
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, ...result.data }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: clientFacingMessage(
          "Errore durante la generazione del percorso.",
          "Unable to build route preview."
        ),
      },
      { status: 500 }
    );
  }
}

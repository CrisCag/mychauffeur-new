import { getComfortModeConfigSync, loadComfortModeConfig } from "@/lib/platform/comfort-mode";
import { NextResponse } from "next/server";

export async function GET() {
  const config = getComfortModeConfigSync().version
    ? getComfortModeConfigSync()
    : await loadComfortModeConfig();
  return NextResponse.json(config, { status: 200 });
}

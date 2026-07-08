import { getWaitTimeRatesConfigSync, loadWaitTimeRatesConfig } from "@/lib/platform/wait-time-pricing";
import { NextResponse } from "next/server";

export async function GET() {
  const config = getWaitTimeRatesConfigSync().version
    ? getWaitTimeRatesConfigSync()
    : await loadWaitTimeRatesConfig();
  return NextResponse.json(config, { status: 200 });
}

import { readFile } from "node:fs/promises";
import path from "node:path";

export type ComfortModeConfig = {
  version: number;
  noRushVip: {
    code: string;
    labelIt: string;
    labelEn: string;
    descriptionIt: string;
    descriptionEn: string;
    markupPercent: number;
    vipStopGraceAfterExtra: boolean;
  };
  standard: {
    gracePercentOnBookedOnly: number;
    gracePercentAfterExtraInApp: number;
    stopMaxExtraPurchaseMinutes: number;
    stopExtraPurchaseOptionsMinutes: number[];
  };
};

const DEFAULT: ComfortModeConfig = {
  version: 1,
  noRushVip: {
    code: "no_rush_vip",
    labelIt: "No Rush · VIP Max Comfort",
    labelEn: "No Rush · VIP Max Comfort",
    descriptionIt:
      "Senza fretta: più tempo alle fermate, tolleranza 20% anche dopo extra in app.",
    descriptionEn: "Unhurried: more time at stops, 20% grace even after in-app extensions.",
    markupPercent: 18,
    vipStopGraceAfterExtra: true,
  },
  standard: {
    gracePercentOnBookedOnly: 20,
    gracePercentAfterExtraInApp: 0,
    stopMaxExtraPurchaseMinutes: 120,
    stopExtraPurchaseOptionsMinutes: [15, 30, 45, 60],
  },
};

let cached: ComfortModeConfig | null = null;

export async function loadComfortModeConfig(): Promise<ComfortModeConfig> {
  if (cached) return cached;
  try {
    const raw = await readFile(
      path.join(process.cwd(), "data", "comfort-mode-config.json"),
      "utf8"
    );
    cached = JSON.parse(raw) as ComfortModeConfig;
    return cached;
  } catch {
    cached = DEFAULT;
    return DEFAULT;
  }
}

export function getComfortModeConfigSync(): ComfortModeConfig {
  return cached ?? DEFAULT;
}

export function applyNoRushMarkup(totalPrice: number, markupPercent: number): number {
  const factor = 1 + Math.max(0, markupPercent) / 100;
  return Math.round(totalPrice * factor * 100) / 100;
}

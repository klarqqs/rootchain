/** Lightweight investment risk lens for dashboards before dedicated ML stack ships. */

import type { RiskLevel } from "@/types/portfolio";

export interface AgRiskBrief {
  score: number;
  headline: string;
  drivers: string[];
}

export function buildPilotRiskBrief(input: {
  risk: RiskLevel;
  escrowReleasedPct?: number;
  daysToHarvest?: number;
  weatherComfort?: number /** 0 poor — 100 excellent */;
}): AgRiskBrief {
  const escrow = typeof input.escrowReleasedPct === "number" ? input.escrowReleasedPct / 100 : 0;
  const nearHarvest =
    typeof input.daysToHarvest === "number"
      ? Math.max(0, 1 - input.daysToHarvest / 140)
      : 0;
  const weather =
    typeof input.weatherComfort === "number" ? input.weatherComfort / 100 : 0.55;

  const tier =
    input.risk === "Low" ? 0.82 : input.risk === "Moderate" ? 0.66 : 0.48;

  const scoreRaw = tier * (0.5 + escrow * 0.25 + nearHarvest * 0.15 + weather * 0.35);
  const score = Math.round(Math.min(100, Math.max(12, scoreRaw * 100)));

  const drivers: string[] = [];
  if (input.daysToHarvest && input.daysToHarvest < 30) drivers.push("Tight maturity window concentrates execution risk.");
  if (weather < 0.45) drivers.push("Climate stress overlays raise hedging diligence.");
  if (tier < 0.6) drivers.push("Harvest bucket carries higher volatility tier.");

  return {
    score,
    headline:
      score > 74 ? "Operational runway favorable for pilot escrow pacing."
      : score > 55 ? "Balanced agronomic runway — tighten milestone attestations."
      : "Elevated diligence — escalate verification before scaling ticket size.",
    drivers:
      drivers.length > 0
        ? drivers
        : [
            "Milestone cadence aligns with coop reporting — continue independent agronomy audit.",
          ],
  };
}

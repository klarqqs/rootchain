import type { RiskLevel } from "@/types/portfolio";

/** Map qualitative risk tiers to a deterministic score for diversification analytics. */

export function riskScoreFromTier(risk: RiskLevel): number {
  switch (risk) {
    case "Low":
      return 2.4;
    case "Moderate":
      return 5;
    default:
      return 8;
  }
}

export function weightedAverageRisk(activePositions: { amount: number; risk: RiskLevel }[]): number {
  const total = activePositions.reduce((s, p) => s + p.amount, 0);
  if (total <= 0) return 0;
  return (
    activePositions.reduce((s, p) => s + p.amount * riskScoreFromTier(p.risk), 0) / total
  );
}

export function estimateDistributionOnHarvest(
  amount: number,
  expectedRoiPct: number,
  realizedDriftPp: number,
): { realizedRoi: number; payoutUsd: number } {
  const realizedRoi = Math.max(0, expectedRoiPct + realizedDriftPp);
  return {
    realizedRoi,
    payoutUsd: amount * (1 + realizedRoi / 100),
  };
}

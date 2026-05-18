import type { ProduceItem } from "@/data/produce";

/** USDC-equivalent valuation of one ownership unit (`sharesTotal` units back the harvest). */
export function tokenPriceUsd(produce: Pick<ProduceItem, "target" | "sharesTotal">): number {
  if (!produce.sharesTotal) return 0;
  return produce.target / produce.sharesTotal;
}

/** Investor ownership slice of total token supply for this harvest. */
export function ownershipPct(
  shares: number,
  produce: Pick<ProduceItem, "sharesTotal">,
): number {
  if (!produce.sharesTotal || produce.sharesTotal <= 0) return 0;
  return (shares / produce.sharesTotal) * 100;
}

/** Projected harvest payout strictly from recorded expected ROI snapshot. */
export function projectedHarvestPayoutUsd(amount: number, expectedRoiPct: number): number {
  return amount * (1 + expectedRoiPct / 100);
}

/** Minimum investor ticket respecting optional listing overrides (pre-IPO API bridge). */
export function deriveInvestmentMinimumUsd(produce: ProduceItem): number {
  return produce.investmentMinimumUsd ?? Math.ceil(tokenPriceUsd(produce));
}

export function escrowLockedUsd(amount: number, releasedPct: number): number {
  const clamp = Math.min(100, Math.max(0, releasedPct));
  return amount * (1 - clamp / 100);
}

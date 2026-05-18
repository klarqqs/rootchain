/**
 * Placeholder agronomic analytics rail — deterministic mock outputs keep UI honest
 * until we wire CropML / weather grids.
 */

export interface AgIntelSnapshot {
  yieldForecastPct: number;
  weatherOutlook: string;
  riskOutlook: string;
  marketMomentum: string;
  nextRefreshAtIso: string;
}

export async function fetchAgIntel(): Promise<AgIntelSnapshot> {
  const now = new Date().toISOString();
  await Promise.resolve(); // symmetry for future RPC calls
  return {
    yieldForecastPct: 6.8,
    weatherOutlook:
      "Monsoon moisture remains balanced across West African maize corridors; watch mid-cycle heat bursts.",
    riskOutlook:
      "Operational risk moderated by milestone escrow pacing; speculative tail risk concentrated in aqua + cattle pools.",
    marketMomentum:
      "Liquidity deepening on ROOTCHAIN-listed cocoa + rice corridors; diversification demand up week-over-week.",
    nextRefreshAtIso: now,
  };
}

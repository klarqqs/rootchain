import { PRODUCE_DATA } from "@/data/produce";

export interface PlatformTransparencySnapshot {
  totalTargetUsd: number;
  totalFundedUsd: number;
  avgFundingProgressPct: number;
  liveListings: number;
  activeInvestorAccounts: number;
}

export function computePlatformTransparency(): PlatformTransparencySnapshot {
  const totalTargetUsd = PRODUCE_DATA.reduce((s, p) => s + p.target, 0);
  const totalFundedUsd = PRODUCE_DATA.reduce((s, p) => s + p.funded, 0);
  const avgFundingProgressPct =
    PRODUCE_DATA.length === 0
      ? 0
      : PRODUCE_DATA.reduce((s, p) => s + (p.funded / p.target) * 100, 0) /
        PRODUCE_DATA.length;

  const activeInvestorAccounts = PRODUCE_DATA.reduce((s, p) => s + p.investorCount, 0);

  return {
    totalTargetUsd,
    totalFundedUsd,
    avgFundingProgressPct,
    liveListings: PRODUCE_DATA.length,
    activeInvestorAccounts,
  };
}

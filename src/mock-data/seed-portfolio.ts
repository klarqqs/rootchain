import type { Investment, PortfolioSnapshot } from "@/types/portfolio";
import { createDefaultMilestoneRail } from "@/tokenization/default-milestones";
import { deriveEscrowLifecycle, milestoneReleasedPct } from "@/escrow/escrow-flow";
import {
  ownershipPct,
  projectedHarvestPayoutUsd,
  tokenPriceUsd,
} from "@/tokenization/harvest-metrics";
import { weightedAverageRisk } from "@/yield-system/distributions";
import { PRODUCE_DATA } from "@/data/produce";

const maizeRail = createDefaultMilestoneRail();
const cocoaRail = createDefaultMilestoneRail();
const maizeReleased = milestoneReleasedPct(maizeRail);
const cocoaReleased = milestoneReleasedPct(cocoaRail);

const SEED_RISK = weightedAverageRisk([
  { amount: 2400, risk: "Low" },
  { amount: 5000, risk: "Moderate" },
]);

/**
 * Initial portfolio used when the wallet has just connected (or for
 * development without a wallet). Real backend will replace this with
 * actual on-chain positions.
 */
export const SEED_INVESTMENTS: Investment[] = [
  {
    id: "inv-RC-0421-1",
    produceId: "RC-0421",
    produceName: "Premium Yellow Maize",
    amount: 2400,
    shares: 2.4,
    expectedRoi: 18.4,
    risk: "Low",
    openedAt: Date.now() - 1000 * 60 * 60 * 24 * 21,
    status: "active",
    growth: 78,
    txHash: "7a9f4dbe22dde62a8c8c44d5deba29e4ca9bf4ce20000000000000000000000",
    ownershipPct: ownershipPct(2.4, PRODUCE_DATA.find((p) => p.id === "RC-0421") ?? { sharesTotal: 100 }),
    tokenPriceUsd: tokenPriceUsd(PRODUCE_DATA.find((p) => p.id === "RC-0421") ?? { sharesTotal: 100, target: 100000 }),
    projectedHarvestUsd: projectedHarvestPayoutUsd(2400, 18.4),
    listingInvestors: PRODUCE_DATA.find((p) => p.id === "RC-0421")?.investorCount,
    maturityHarvestDate: PRODUCE_DATA.find((p) => p.id === "RC-0421")?.harvestDate,
    daysToHarvestAtOpen: PRODUCE_DATA.find((p) => p.id === "RC-0421")?.daysToHarvest,
    certificateId: "cert-inv-0421-phase4",
    milestones: maizeRail,
    escrowReleasedPct: maizeReleased,
    escrowStatus: deriveEscrowLifecycle(maizeReleased, false),
  },
  {
    id: "inv-RC-0388-1",
    produceId: "RC-0388",
    produceName: "Grade-A Cocoa Beans",
    amount: 5000,
    shares: 2.2,
    expectedRoi: 24.1,
    risk: "Moderate",
    openedAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    status: "active",
    growth: 62,
    txHash: "3f12abe64fbb76d0e21c12b4c6f8a1e98cef8b910000000000000000000000",
    ownershipPct: ownershipPct(
      2.2,
      PRODUCE_DATA.find((p) => p.id === "RC-0388") ?? { sharesTotal: 80 },
    ),
    tokenPriceUsd: tokenPriceUsd(PRODUCE_DATA.find((p) => p.id === "RC-0388") ?? { sharesTotal: 80, target: 180000 }),
    projectedHarvestUsd: projectedHarvestPayoutUsd(5000, 24.1),
    listingInvestors: PRODUCE_DATA.find((p) => p.id === "RC-0388")?.investorCount,
    maturityHarvestDate: PRODUCE_DATA.find((p) => p.id === "RC-0388")?.harvestDate,
    daysToHarvestAtOpen: PRODUCE_DATA.find((p) => p.id === "RC-0388")?.daysToHarvest,
    certificateId: "cert-inv-0388-phase4",
    milestones: cocoaRail,
    escrowReleasedPct: cocoaReleased,
    escrowStatus: deriveEscrowLifecycle(cocoaReleased, false),
  },
];

export const SEED_PORTFOLIO: PortfolioSnapshot = {
  totalInvested: 7400,
  totalProjected: 7400 * 1.214,
  realizedYield: 6124.4,
  pendingClaims: 3420,
  activeCount: 2,
  harvestedCount: 0,
  blendedRoi: 21.4,
  activeEscrowLockedUsd: 7400,
  avgEscrowReleasedPct: 0,
  blendedRiskScore: SEED_RISK,
};

import type { EscrowLifecycleStatus } from "@/types/escrow";
import type { HarvestMilestone } from "@/types/milestone";

export type RiskLevel = "Low" | "Moderate" | "Higher";

export interface Investment {
  /** Stable identity per produce listing. */
  id: string;
  /** Reference to the underlying ProduceItem. */
  produceId: string;
  produceName: string;
  /** Amount of USDC committed. */
  amount: number;
  /** Number of shares purchased. */
  shares: number;
  /** Expected ROI at investment time (snapshot). */
  expectedRoi: number;
  /** Risk snapshot. */
  risk: RiskLevel;
  /** Unix ms when the investment was opened. */
  openedAt: number;
  /** Optional close timestamp once realized. */
  closedAt?: number;
  /** Realized ROI at close (only when closedAt set). */
  realizedRoi?: number;
  /** Status of the underlying milestone progression. */
  status: "active" | "harvested" | "closed";
  /** Latest growth percentage observed. */
  growth: number;
  /** Tx hash that opened this position. */
  txHash: string;
  /** Snapshot of fractional ownership versus total issuance. */
  ownershipPct?: number;
  /** Planned USDC denomination per share (`target / sharesTotal`). */
  tokenPriceUsd?: number;
  /** Projected payout at modeled harvest using expected ROI snapshot. */
  projectedHarvestUsd?: number;
  /** Platform-reported cohort size backing social proof widgets. */
  listingInvestors?: number;
  /** Human-readable maturity label pulled from marketplace metadata. */
  maturityHarvestDate?: string;
  /** Days-to-harvest snapshot when investor entered. */
  daysToHarvestAtOpen?: number;
  /** Stable certificate identifier for downloadable attestations UI. */
  certificateId?: string;
  /** Escrow disbursement pacing (farm-controlled simulation). */
  escrowStatus?: EscrowLifecycleStatus;
  /** Amount of disbursement milestones cleared (derived from milestones). */
  escrowReleasedPct?: number;
  /** Milestone runway cloned at investment time — advances unlock farmer tranches. */
  milestones?: HarvestMilestone[];
  /** Mirrors active RC-style harvest token metadata on Horizon for pilot transparency. */
  ledgerAssetCode?: string;
  ledgerAssetIssuer?: string;
}

export interface PortfolioSnapshot {
  totalInvested: number;
  totalProjected: number;
  realizedYield: number;
  pendingClaims: number;
  activeCount: number;
  harvestedCount: number;
  blendedRoi: number;
  /** Weight of capital still escrowed awaiting milestone verification. */
  activeEscrowLockedUsd?: number;
  /** Blended disbursement pacing across active harvests (0–100). */
  avgEscrowReleasedPct?: number;
  /** Blended diversification risk score anchored to categorical tiers. */
  blendedRiskScore?: number;
}

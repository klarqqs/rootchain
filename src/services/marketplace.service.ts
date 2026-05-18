/**
 * Marketplace service — list produce, simulate investment + sell flows.
 * Reads from /mock-data; writes go through the transaction service.
 */

import { mockGet } from "@/api/client";
import { PRODUCE_DATA, type ProduceItem } from "@/data/produce";
import type { Investment } from "@/types/portfolio";
import type { Result } from "@/types/common";
import { ok } from "@/types/common";
import { submitClaim, submitInvestment } from "./transaction.service";
import type { TxRecord } from "@/types/transaction";
import { createDefaultMilestoneRail } from "@/tokenization/default-milestones";
import { deriveEscrowLifecycle, milestoneReleasedPct } from "@/escrow/escrow-flow";
import {
  ownershipPct,
  projectedHarvestPayoutUsd,
  tokenPriceUsd,
} from "@/tokenization/harvest-metrics";
import { getActiveRcCode, getActiveRcIssuer } from "@/lib/stellar/effective-network";

export async function listProduce(): Promise<Result<ProduceItem[]>> {
  return mockGet(() => ok(PRODUCE_DATA));
}

export async function getProduce(id: string): Promise<Result<ProduceItem | null>> {
  return mockGet(() => ok(PRODUCE_DATA.find((p) => p.id === id) ?? null));
}

export interface InvestRequest {
  produce: ProduceItem;
  amount: number;
}

/**
 * Begin an investment. Returns the tx hash immediately + a finalized
 * promise; the caller can use the returned `Investment` to extend the
 * portfolio store after settlement.
 */
export function invest(req: InvestRequest) {
  const shares = Math.floor((req.amount / req.produce.target) * req.produce.sharesTotal * 10) / 10;

  const tx = submitInvestment({
    produceId: req.produce.id,
    produceName: req.produce.name,
    amount: req.amount,
    shares,
    expectedRoi: req.produce.roi,
  });

  const buildInvestment = (record: TxRecord): Investment => {
    const milestones = createDefaultMilestoneRail();
    const escrowReleasedPct = milestoneReleasedPct(milestones);
    const tokenPrice = tokenPriceUsd(req.produce);
    const pct = ownershipPct(shares, req.produce);

    return {
      id: `inv-${req.produce.id}-${record.hash.slice(0, 6)}`,
      produceId: req.produce.id,
      produceName: req.produce.name,
      amount: req.amount,
      shares,
      expectedRoi: req.produce.roi,
      risk: req.produce.risk,
      openedAt: record.createdAt,
      status: "active",
      growth: req.produce.growth,
      txHash: record.hash,
      ownershipPct: pct,
      tokenPriceUsd: tokenPrice,
      projectedHarvestUsd: projectedHarvestPayoutUsd(req.amount, req.produce.roi),
      listingInvestors: req.produce.investorCount,
      maturityHarvestDate: req.produce.harvestDate,
      daysToHarvestAtOpen: req.produce.daysToHarvest,
      certificateId: `cert-${req.produce.id}-${record.hash.slice(0, 10)}`,
      ledgerAssetCode: getActiveRcCode(),
      ledgerAssetIssuer: getActiveRcIssuer(),
      milestones,
      escrowReleasedPct,
      escrowStatus: deriveEscrowLifecycle(escrowReleasedPct, false),
    };
  };

  return { ...tx, buildInvestment, shares };
}

/**
 * Sell / claim payout for an existing position. Returns the tx + the realized
 * ROI, derived from the produce's expected ROI plus a small randomized drift.
 */
export function sell(position: Investment) {
  const drift = (Math.random() - 0.5) * 4; // ±2pp jitter
  const realizedRoi = Math.max(0, position.expectedRoi + drift);
  const payout = position.amount * (1 + realizedRoi / 100);

  const tx = submitClaim({
    produceId: position.produceId,
    produceName: position.produceName,
    amount: payout,
  });

  return { ...tx, realizedRoi, payout };
}

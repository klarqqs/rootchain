/**
 * Escrow abstraction — institutional settlement rail for USDC investments.
 * Soroban contract integration hooks in Phase 3.
 */

import { getPlatformEscrow, getStellarNetwork } from "./config.js";
import { buildInvestmentMemo } from "./verify.js";

export interface EscrowDepositIntent {
  projectId: string;
  amountUsdc: number;
  investorPublicKey: string;
}

export function getEscrowTreasuryAddress(): string {
  const addr = getPlatformEscrow();
  if (!addr) {
    throw new Error(
      `Platform escrow not configured for ${getStellarNetwork()}. Set PLATFORM_ESCROW_* env.`,
    );
  }
  return addr;
}

export function describeEscrowIntent(intent: EscrowDepositIntent) {
  return {
    network: getStellarNetwork(),
    escrow: getEscrowTreasuryAddress(),
    memo: buildInvestmentMemo(intent.projectId),
    asset: "USDC",
    amount: intent.amountUsdc,
    source: intent.investorPublicKey,
  };
}

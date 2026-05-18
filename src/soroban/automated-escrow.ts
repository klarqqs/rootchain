/** Milestone disbursement scaffolding for Soroban upgrade path (Phase 6+). */

import { getActiveSorobanRpc } from "@/lib/stellar/config";
import type { HarvestMilestone } from "@/types/milestone";

const env = import.meta.env;

/** Optional hosted Soroban contract id — wire after deployment. */
export function milestoneEscrowContractId(): string {
  const raw = env.VITE_SOROBAN_MILESTONE_ESCROW_ID_MAINNET ?? env.VITE_SOROBAN_MILESTONE_ESCROW_ID;
  return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : "";
}

export interface EscrowAutomationHealth {
  rpc: string;
  contractLoaded: boolean;
  /** Human-readable next engineering step during pilot rollout. */
  rolloutNote: string;
}

/** Surface automation readiness without pretending on-chain escrow is wired in this SPA build. */
export function describeAutomatedEscrowHealth(): EscrowAutomationHealth {
  const contractLoaded = Boolean(milestoneEscrowContractId());
  return {
    rpc: getActiveSorobanRpc(),
    contractLoaded,
    rolloutNote:
      contractLoaded ?
        "Milestone disbursement payloads can migrate to Soroban once backend relayers attest farmer checkpoints."
      : "Deploy Soroban milestone vault + registrar, then hydrate VITE_SOROBAN_MILESTONE_ESCROW_ID for automated releases.",
  };
}

/** Pure helper mirrored from UI milestone widgets — deterministic off-chain pacing summary. */
export function summarizeEscrowRail(milestones: HarvestMilestone[]): string {
  const verified = milestones.filter((m) => m.status === "verified").length;
  const pend = milestones.filter((m) => m.status === "pending").length;
  return `${verified}/${milestones.length || 1} milestones verified · ${pend} awaiting field evidence`;
}

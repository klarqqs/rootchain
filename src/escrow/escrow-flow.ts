import type { HarvestMilestone } from "@/types/milestone";
import type { EscrowLifecycleStatus } from "@/types/escrow";

function sumReleasedWeight(milestones: HarvestMilestone[]): number {
  return milestones.reduce(
    (s, m) => (m.status === "verified" ? s + m.releaseWeightPct : s),
    0,
  );
}

export function deriveEscrowLifecycle(
  escrowReleasedPct: number,
  refunded: boolean,
): EscrowLifecycleStatus {
  if (refunded) return "refunded";
  if (escrowReleasedPct >= 99.5) return "completed";
  if (escrowReleasedPct > 0) return "partially_released";
  return "locked";
}

/** Initial state immediately after treasury receives investor funds — funds sit in escrow. */
export function initialEscrowStatus(): EscrowLifecycleStatus {
  return "locked";
}

/**
 * Mark the earliest pending milestone as verified + advance released percentage weighting.
 */
export function advanceNextMilestone(
  milestones: HarvestMilestone[],
  now: number,
): HarvestMilestone[] {
  const nextIdx = milestones.findIndex((m) => m.status === "pending");
  if (nextIdx === -1) return milestones;

  return milestones.map((m, idx) =>
    idx === nextIdx ? { ...m, status: "verified" as const, verifiedAt: now } : m,
  );
}

/** Total percentage of escrow cleared for milestone-verified disbursements (0–100). */
export function milestoneReleasedPct(milestones: HarvestMilestone[]): number {
  return Math.min(100, sumReleasedWeight(milestones));
}

import type { HarvestMilestone } from "@/types/milestone";

/**
 * Canonical six-step harvest rail. Weights intentionally sum to ~100%.
 * Verified milestones advance escrow release percentages in escrow-flow.ts.
 */

const TEMPLATE: Omit<HarvestMilestone, "status" | "verifiedAt">[] = [
  { id: "ms-01", slug: "land_prep", label: "Land preparation", releaseWeightPct: 10 },
  { id: "ms-02", slug: "seed_purchase", label: "Seed purchase", releaseWeightPct: 12 },
  { id: "ms-03", slug: "planting", label: "Planting completed", releaseWeightPct: 14 },
  { id: "ms-04", slug: "irrigation", label: "Irrigation milestones", releaseWeightPct: 16 },
  { id: "ms-05", slug: "growth_verify", label: "Crop growth verification", releaseWeightPct: 20 },
  { id: "ms-06", slug: "harvest", label: "Harvest completion", releaseWeightPct: 28 },
];

export function createDefaultMilestoneRail(): HarvestMilestone[] {
  return TEMPLATE.map((m) => ({ ...m, status: "pending" }));
}

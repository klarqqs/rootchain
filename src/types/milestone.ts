/** Single harvest milestone tracked per investment position (simulated escrow rail). */

export interface HarvestMilestone {
  id: string;
  slug: string;
  label: string;
  /** Portion of total cycle this milestone unlocks toward farmer disbursement (0–100). Weights sum to 100 across the template. */
  releaseWeightPct: number;
  status: "pending" | "verified";
  /** Unix ms when verified (Phase 4 simulation / future oracle). */
  verifiedAt?: number;
}

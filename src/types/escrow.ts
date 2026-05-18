/** Escrow lifecycle for milestone-gated farmer releases (backend-simulated in Phase 4). */
export type EscrowLifecycleStatus =
  | "pending"
  | "locked"
  | "partially_released"
  | "completed"
  | "refunded";

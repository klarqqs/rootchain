import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Investment, PortfolioSnapshot } from "@/types/portfolio";
import { SEED_INVESTMENTS, SEED_PORTFOLIO } from "@/mock-data/seed-portfolio";
import { advanceNextMilestone, deriveEscrowLifecycle, milestoneReleasedPct } from "@/escrow/escrow-flow";
import { createDefaultMilestoneRail } from "@/tokenization/default-milestones";
import { escrowLockedUsd } from "@/tokenization/harvest-metrics";
import { weightedAverageRisk } from "@/yield-system/distributions";
import { useActivityFeedStore } from "@/store/activity-feed.store";

interface PortfolioState {
  positions: Investment[];
  snapshot: PortfolioSnapshot;
  isSeeded: boolean;
}

interface PortfolioActions {
  seedIfEmpty: () => void;
  addInvestment: (inv: Investment) => void;
  updateInvestment: (id: string, patch: Partial<Investment>) => void;
  closeInvestment: (id: string, realizedRoi: number) => void;
  advanceHarvestMilestone: (id: string) => void;
  reset: () => void;
}

function recomputeSnapshot(positions: Investment[]): PortfolioSnapshot {
  const active = positions.filter((p) => p.status === "active");
  const harvested = positions.filter((p) => p.status === "harvested");
  const totalInvested = positions.reduce((s, p) => s + p.amount, 0);
  const totalProjected = positions.reduce(
    (s, p) => s + p.amount * (1 + p.expectedRoi / 100),
    0,
  );
  const realizedYield = harvested.reduce(
    (s, p) => s + p.amount * ((p.realizedRoi ?? 0) / 100),
    0,
  );
  const blendedRoi =
    positions.length === 0
      ? 0
      : positions.reduce((s, p) => s + p.expectedRoi, 0) / positions.length;
  const pendingClaims = active
    .filter((p) => p.growth >= 60)
    .reduce((s, p) => s + p.amount * (p.expectedRoi / 100), 0);

  const activeEscrowLockedUsd = active.reduce(
    (s, p) => s + escrowLockedUsd(p.amount, p.escrowReleasedPct ?? 0),
    0,
  );
  const avgEscrowReleasedPct =
    active.length === 0
      ? 0
      : active.reduce((s, p) => s + (p.escrowReleasedPct ?? 0), 0) / active.length;
  const blendedRiskScore =
    active.length === 0
      ? 0
      : weightedAverageRisk(active.map((p) => ({ amount: p.amount, risk: p.risk })));

  return {
    totalInvested,
    totalProjected,
    realizedYield,
    pendingClaims,
    activeCount: active.length,
    harvestedCount: harvested.length,
    blendedRoi,
    activeEscrowLockedUsd,
    avgEscrowReleasedPct,
    blendedRiskScore,
  };
}

export const usePortfolioStore = create<PortfolioState & PortfolioActions>()(
  persist(
    (set, get) => ({
      positions: [],
      snapshot: SEED_PORTFOLIO,
      isSeeded: false,
      seedIfEmpty: () => {
        if (!get().isSeeded && get().positions.length === 0) {
          set({
            positions: SEED_INVESTMENTS,
            snapshot: recomputeSnapshot(SEED_INVESTMENTS),
            isSeeded: true,
          });
        } else {
          set({ isSeeded: true });
        }
      },
      addInvestment: (inv) => {
        const next = [inv, ...get().positions];
        set({ positions: next, snapshot: recomputeSnapshot(next) });
      },
      updateInvestment: (id, patch) => {
        const next = get().positions.map((p) =>
          p.id === id ? { ...p, ...patch } : p,
        );
        set({ positions: next, snapshot: recomputeSnapshot(next) });
      },
      closeInvestment: (id, realizedRoi) => {
        const next = get().positions.map((p) =>
          p.id === id
            ? { ...p, status: "closed" as const, realizedRoi, closedAt: Date.now() }
            : p,
        );
        set({ positions: next, snapshot: recomputeSnapshot(next) });
      },
      advanceHarvestMilestone: (id) => {
        const current = get().positions.find((p) => p.id === id);
        if (!current || current.status === "closed") return;

        const rail =
          current.milestones && current.milestones.length > 0
            ? current.milestones.map((m) => ({ ...m }))
            : createDefaultMilestoneRail();

        if (!rail.some((m) => m.status === "pending")) {
          return;
        }

        const now = Date.now();
        const nextRail = advanceNextMilestone(rail, now);
        const releasedPct = milestoneReleasedPct(nextRail);
        const escrowStatus = deriveEscrowLifecycle(releasedPct, false);
        const lastVerified = nextRail.filter((m) => m.status === "verified").at(-1);

        const nextStatus = releasedPct >= 99.5 ? ("harvested" as const) : current.status;

        get().updateInvestment(id, {
          milestones: nextRail,
          escrowReleasedPct: releasedPct,
          escrowStatus,
          status: nextStatus,
        });

        useActivityFeedStore.getState().push({
          category: "milestone",
          tone: "success",
          title: lastVerified
            ? `Milestone verified · ${lastVerified.label}`
            : "Milestone rail updated",
          body: `${current.produceName} escrow now ${releasedPct.toFixed(1)}% cleared for disbursements.`,
          meta: {
            produceId: current.produceId,
            escrowStatus,
          },
        });

        if (releasedPct >= 99.5) {
          useActivityFeedStore.getState().push({
            category: "escrow",
            tone: "success",
            title: "Escrow fully released · harvest runway complete",
            body: `${current.produceName} moved into distribution-ready state.`,
            meta: { produceId: current.produceId, escrowStatus: "completed" },
          });
        }
      },
      reset: () =>
        set({ positions: [], snapshot: SEED_PORTFOLIO, isSeeded: false }),
    }),
    {
      name: "rootchain.portfolio.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        positions: state.positions,
        snapshot: state.snapshot,
        isSeeded: state.isSeeded,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.snapshot = recomputeSnapshot(state.positions);
        }
      },
    },
  ),
);

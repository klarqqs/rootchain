import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePortfolioStore } from "@/store/portfolio.store";

export function usePortfolio() {
  const { positions, snapshot, isSeeded, seedIfEmpty } = usePortfolioStore(
    useShallow((s) => ({
      positions: s.positions,
      snapshot: s.snapshot,
      isSeeded: s.isSeeded,
      seedIfEmpty: s.seedIfEmpty,
    })),
  );
  const advanceHarvestMilestone = usePortfolioStore((s) => s.advanceHarvestMilestone);

  useEffect(() => {
    if (!isSeeded) seedIfEmpty();
  }, [isSeeded, seedIfEmpty]);

  return { positions, snapshot, advanceHarvestMilestone };
}
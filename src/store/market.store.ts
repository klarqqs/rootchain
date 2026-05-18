import { create } from "zustand";
import type { LiveActivity } from "@/data/social";
import { LIVE_ACTIVITY } from "@/data/social";

interface MarketState {
  activity: LiveActivity[];
  push: (entry: LiveActivity) => void;
  clear: () => void;
}

const MAX_ENTRIES = 60;

export const useMarketStore = create<MarketState>((set) => ({
  activity: LIVE_ACTIVITY,
  push: (entry) =>
    set((s) => ({ activity: [entry, ...s.activity].slice(0, MAX_ENTRIES) })),
  clear: () => set({ activity: [] }),
}));

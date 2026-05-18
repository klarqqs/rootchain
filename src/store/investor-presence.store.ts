import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface InvestorPresence {
  displayName: string;
  regionSlug: string;
  /** 0–5 pilot trust ribbons */
  trustScore: number;
}

interface InvestorPresenceActions {
  setDisplayName: (v: string) => void;
  setRegionSlug: (v: string) => void;
  bumpTrust: () => void;
}

const preset: InvestorPresence = {
  displayName: "",
  regionSlug: "",
  trustScore: 3,
};

export const useInvestorPresenceStore = create<InvestorPresence & InvestorPresenceActions>()(
  persist(
    (set) => ({
      ...preset,
      setDisplayName: (displayName) => set({ displayName }),
      setRegionSlug: (regionSlug) => set({ regionSlug }),
      bumpTrust: () =>
        set((state) => ({ trustScore: Math.min(5, state.trustScore + 0.05) })),
    }),
    {
      name: "rootchain-investor-presence-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        displayName: s.displayName,
        regionSlug: s.regionSlug,
        trustScore: s.trustScore,
      }),
    },
  ),
);

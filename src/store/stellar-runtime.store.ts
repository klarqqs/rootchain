import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StellarNetwork } from "@/types/wallet";

interface StellarRuntimeState {
  /** When set, overrides `VITE_STELLAR_NETWORK` for Horizon + explorers (still gated below). */
  userNetworkOverride: StellarNetwork | null;
}

interface StellarRuntimeActions {
  setUserNetworkOverride: (net: StellarNetwork | null) => void;
}

export const useStellarRuntimeStore = create<StellarRuntimeState & StellarRuntimeActions>()(
  persist(
    (set) => ({
      userNetworkOverride: null,
      setUserNetworkOverride: (net) => set({ userNetworkOverride: net }),
    }),
    {
      name: "rootchain-stellar-runtime-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ userNetworkOverride: s.userNetworkOverride }),
    },
  ),
);

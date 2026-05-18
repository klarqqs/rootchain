import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { normalizeFarmerHandle } from "@/data/market-farmers";

interface FarmerNetworkState {
  /** Normalized slug keys (without @). */
  following: Record<string, boolean>;
  /** One-way handshake flag for MVP — messaging layer hooks in later. */
  connected: Record<string, boolean>;
  toggleFollow: (rawHandle: string) => void;
  /** Idempotent optimistic connect UX. */
  connectWith: (rawHandle: string) => void;
  isFollowing: (rawHandle: string) => boolean;
  isConnected: (rawHandle: string) => boolean;
}

export const useFarmerNetworkStore = create<FarmerNetworkState>()(
  persist(
    (set, get) => ({
      following: {},
      connected: {},
      toggleFollow: (raw) => {
        const h = normalizeFarmerHandle(raw);
        const next = !get().following[h];
        set((s) => ({
          following: { ...s.following, [h]: next },
        }));
      },
      connectWith: (raw) =>
        set((s) => ({ connected: { ...s.connected, [normalizeFarmerHandle(raw)]: true } })),
      isFollowing: (raw) => !!get().following[normalizeFarmerHandle(raw)],
      isConnected: (raw) => !!get().connected[normalizeFarmerHandle(raw)],
    }),
    { name: "rc-farmer-network-v1", storage: createJSONStorage(() => localStorage) },
  ),
);

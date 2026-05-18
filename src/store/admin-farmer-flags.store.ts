import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** Local-only moderation flags for demo admin — replace with Supabase RLS + roles. */
interface AdminFarmerFlagsState {
  overrides: Record<string, { verified?: boolean; tier?: string }>;
  setVerified: (farmerId: string, verified: boolean) => void;
  setTier: (farmerId: string, tier: string) => void;
  reset: () => void;
}

export const useAdminFarmerFlagsStore = create<AdminFarmerFlagsState>()(
  persist(
    (set) => ({
      overrides: {},
      setVerified: (farmerId, verified) =>
        set((s) => ({
          overrides: { ...s.overrides, [farmerId]: { ...s.overrides[farmerId], verified } },
        })),
      setTier: (farmerId, tier) =>
        set((s) => ({
          overrides: { ...s.overrides, [farmerId]: { ...s.overrides[farmerId], tier } },
        })),
      reset: () => set({ overrides: {} }),
    }),
    {
      name: "rootchain.admin-farmer-flags.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface FarmerApplication {
  id: string;
  fullName: string;
  email: string;
  farmName: string;
  region: string;
  specialties: string;
  stellarHint?: string;
  notes?: string;
  /** Local preview URLs — transient, not persisted in partialize except count */
  submittedAt: number;
  status: "received" | "under_review" | "verified";
}

interface FarmerApplicationsState {
  items: FarmerApplication[];
  submit: (draft: Omit<FarmerApplication, "id" | "submittedAt" | "status">) => void;
  clear: () => void;
}

const genId = () => `fa_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export const useFarmerApplicationsStore = create<FarmerApplicationsState>()(
  persist(
    (set, get) => ({
      items: [],
      submit: (draft) => {
        const row: FarmerApplication = {
          ...draft,
          id: genId(),
          submittedAt: Date.now(),
          status: "received",
        };
        set({ items: [row, ...get().items].slice(0, 50) });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "rootchain.farmer-apps.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

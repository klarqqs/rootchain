import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface OnboardingState {
  /** User completed or skipped guided setup. */
  completed: boolean;
  /** Step index 0-based for UI progress. */
  step: number;
  markStep: (step: number) => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      step: 0,
      markStep: (step) => set({ step }),
      complete: () => set({ completed: true, step: 0 }),
      reset: () => set({ completed: false, step: 0 }),
    }),
    {
      name: "rootchain.onboarding.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

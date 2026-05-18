import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WaitlistState {
  subscribers: Array<{ email: string; ts: number }>;
}

interface WaitlistActions {
  joinWaitlist: (email: string) => "ok" | "duplicate" | "invalid";
}

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export const usePilotWaitlistStore = create<WaitlistState & WaitlistActions>()(
  persist(
    (set, get) => ({
      subscribers: [],
      joinWaitlist: (emailRaw) => {
        const email = emailRaw.trim().toLowerCase();
        if (!emailRx.test(email)) return "invalid";
        const dup = get().subscribers.some((s) => s.email === email);
        if (dup) return "duplicate";
        const next = [{ email, ts: Date.now() }, ...get().subscribers].slice(0, 2400);
        set({ subscribers: next });
        return "ok";
      },
    }),
    {
      name: "rootchain-pilot-waitlist",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ subscribers: s.subscribers }),
    },
  ),
);

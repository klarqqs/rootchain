import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import type { AppProfileRow } from "@/database/types";
import { supabase } from "@/database/client";

export type IdentityHydration = "pending" | "ready";

interface IdentityState {
  hydration: IdentityHydration;
  session: Session | null;
  profile: AppProfileRow | null;
  passwordRecoveryMode: boolean;
  setHydration: (h: IdentityHydration) => void;
  /**
   * Replaces identity slice from auth listener / getSession — does not persist
   * (session lives in Supabase hybrid storage).
   */
  setAuthSnapshot: (
    snapshot: Partial<Pick<IdentityState, "session" | "profile" | "passwordRecoveryMode">>,
  ) => void;
  clear: () => void;
}

export const useIdentityStore = create<IdentityState>((set) => ({
  hydration: supabase ? "pending" : "ready",
  session: null,
  profile: null,
  passwordRecoveryMode: false,
  setHydration: (h) => set({ hydration: h }),
  setAuthSnapshot: (snap) =>
    set((prev) => ({
      session: snap.session !== undefined ? snap.session : prev.session,
      profile: snap.profile !== undefined ? snap.profile : prev.profile,
      passwordRecoveryMode:
        snap.passwordRecoveryMode !== undefined ? snap.passwordRecoveryMode : prev.passwordRecoveryMode,
    })),
  clear: () =>
    set({
      session: null,
      profile: null,
      passwordRecoveryMode: false,
    }),
}));

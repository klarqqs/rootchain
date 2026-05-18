import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AuthStatus = "anonymous" | "authenticating" | "authenticated";

export interface AuthSession {
  /** Stellar G-public-key associated with this session. */
  publicKey: string;
  /** Issued at timestamp (ms). */
  issuedAt: number;
  /** Expiry timestamp (ms). */
  expiresAt: number;
  /** Provider that signed the session challenge. */
  provider: string;
  /** Mock session token. Phase 3 will replace with a real SEP-10 JWT. */
  token: string;
}

interface AuthState {
  status: AuthStatus;
  session: AuthSession | null;
}

interface AuthActions {
  beginSignIn: () => void;
  completeSignIn: (session: AuthSession) => void;
  signOut: () => void;
  isExpired: () => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      status: "anonymous",
      session: null,
      beginSignIn: () => set({ status: "authenticating" }),
      completeSignIn: (session) => set({ status: "authenticated", session }),
      signOut: () => set({ status: "anonymous", session: null }),
      isExpired: () => {
        const s = get().session;
        if (!s) return true;
        return Date.now() >= s.expiresAt;
      },
    }),
    {
      name: "rootchain.auth.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ status: s.status, session: s.session }),
    },
  ),
);

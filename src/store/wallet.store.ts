import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WalletAccount, WalletBalance, WalletState } from "@/types/wallet";

export const WALLET_PERSIST_KEY = "rootchain.wallet.v1";

const DEFAULT_STATE: WalletState = {
  status: "disconnected",
  account: null,
  balances: [],
  totalUsd: 0,
  isHydrated: false,
  lastError: null,
  sessionStartedAt: null,
};

/** Remove persisted wallet session from localStorage (non-fatal if unavailable). */
export function removeWalletFromLocalStorage(): void {
  try {
    localStorage.removeItem(WALLET_PERSIST_KEY);
  } catch {
    /* private browsing / quota */
  }
}

interface WalletActions {
  setConnecting: () => void;
  setConnected: (account: WalletAccount, balances: WalletBalance[]) => void;
  setDisconnected: () => void;
  disconnectWallet: () => void;
  setError: (message: string) => void;
  setBalances: (balances: WalletBalance[]) => void;
  markHydrated: () => void;
}

const sumUsd = (balances: WalletBalance[]) =>
  balances.reduce((acc, b) => acc + b.usdValue, 0);

export const useWalletStore = create<WalletState & WalletActions>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setConnecting: () => set({ status: "connecting", lastError: null }),
      setConnected: (account, balances) =>
        set({
          status: "connected",
          account,
          balances,
          totalUsd: sumUsd(balances),
          lastError: null,
          sessionStartedAt: Date.now(),
        }),
      setDisconnected: () =>
        set({
          status: "disconnected",
          account: null,
          balances: [],
          totalUsd: 0,
          lastError: null,
          sessionStartedAt: null,
        }),
      disconnectWallet: () => {
        removeWalletFromLocalStorage();
        set({ ...DEFAULT_STATE, isHydrated: true });
        void useWalletStore.persist.clearStorage();
      },
      setError: (message) => set({ status: "error", lastError: message }),
      setBalances: (balances) => set({ balances, totalUsd: sumUsd(balances) }),
      markHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: WALLET_PERSIST_KEY,
      storage: createJSONStorage(() => localStorage),
      /** Persist session metadata only — balances always come from Horizon. */
      partialize: (state) => ({
        status: state.status,
        account: state.account,
        sessionStartedAt: state.sessionStartedAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
        if (state?.status === "connected" && state.account) {
          state.setBalances([]);
        }
      },
    },
  ),
);

export const useWalletConnected = () =>
  useWalletStore((s) => s.status === "connected" && !!s.account);

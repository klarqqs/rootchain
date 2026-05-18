import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WalletAccount, WalletBalance, WalletState } from "@/types/wallet";
import { tokens } from "@/lib/tokens";

const SEED_BALANCES_FOR_DEMO: WalletBalance[] = [
  { asset: "USDC", symbol: "USDC", amount: 28247.18, usdValue: 28247.18, chg24h: 0.01, color: "#2775CA", icon: "$" },
  { asset: "XLM", symbol: "XLM", amount: 14820, usdValue: 14820 * 0.118, chg24h: 1.9, color: "#7D00FF", icon: "✦" },
  { asset: "RCSHARE", symbol: "RC-SHARES", amount: 142.4, usdValue: 8420.30, chg24h: 4.2, color: "#84CC16", icon: "♢" },
];

const DEFAULT_STATE: WalletState = {
  status: "disconnected",
  account: null,
  balances: [],
  totalUsd: 0,
  isHydrated: false,
  lastError: null,
  sessionStartedAt: null,
};

interface WalletActions {
  setConnecting: () => void;
  setConnected: (account: WalletAccount, balances: WalletBalance[]) => void;
  setDisconnected: () => void;
  setError: (message: string) => void;
  setBalances: (balances: WalletBalance[]) => void;
  /**
   * Mutate the stored balance for a single asset by `delta`. Used by the
   * marketplace + transaction engine after a simulated transfer settles.
   */
  adjustBalance: (symbol: string, delta: number) => void;
  /** Seed mock balances for demo when not hooked into a real wallet. */
  seedDemoBalances: () => void;
  markHydrated: () => void;
}

const sumUsd = (balances: WalletBalance[]) =>
  balances.reduce((acc, b) => acc + b.usdValue, 0);

export const useWalletStore = create<WalletState & WalletActions>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,
      setConnecting: () =>
        set({ status: "connecting", lastError: null }),
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
      setError: (message) =>
        set({ status: "error", lastError: message }),
      setBalances: (balances) =>
        set({ balances, totalUsd: sumUsd(balances) }),
      adjustBalance: (symbol, delta) => {
        const balances = get().balances;
        let mutated = false;
        const next = balances.map((b) => {
          if (b.symbol === symbol || b.asset === symbol) {
            mutated = true;
            const amount = Math.max(0, b.amount + delta);
            const usd = (b.usdValue / Math.max(b.amount, 0.0001)) * amount;
            return { ...b, amount, usdValue: usd };
          }
          return b;
        });
        if (!mutated) {
          // Asset wasn't in the wallet — add a row so the change is visible.
          next.push({
            asset: symbol,
            symbol,
            amount: Math.max(0, delta),
            usdValue: Math.max(0, delta) * (symbol === "USDC" ? 1 : 1),
            chg24h: 0,
            color: tokens.lime[500],
            icon: symbol.charAt(0),
          });
        }
        set({ balances: next, totalUsd: sumUsd(next) });
      },
      seedDemoBalances: () => {
        if (get().balances.length === 0) {
          set({ balances: SEED_BALANCES_FOR_DEMO, totalUsd: sumUsd(SEED_BALANCES_FOR_DEMO) });
        }
      },
      markHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "rootchain.wallet.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        status: state.status,
        account: state.account,
        balances: state.balances,
        totalUsd: state.totalUsd,
        sessionStartedAt: state.sessionStartedAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

export const useWalletConnected = () =>
  useWalletStore((s) => s.status === "connected" && !!s.account);

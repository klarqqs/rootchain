/**
 * Hook that drives live Horizon sync for the connected wallet.
 * Mount once in App.tsx (or another top-level component).
 */

import { useEffect, useRef } from "react";
import { useWalletStore } from "@/store/wallet.store";
import { startRealtime, stopRealtime } from "@/realtime";
import { refreshBalancesNow } from "@/realtime/balance-sync";

/** Starts/stops realtime sync whenever the wallet connection status changes. */
export function useHorizonSync() {
  const status = useWalletStore((s) => s.status);
  const provider = useWalletStore((s) => s.account?.provider);
  const prevStatus = useRef<string | null>(null);

  useEffect(() => {
    const isConnected = status === "connected";
    const wasConnected = prevStatus.current === "connected";
    prevStatus.current = status;

    if (isConnected && !wasConnected) {
      // Just connected — start all live-sync services.
      startRealtime();
    } else if (!isConnected && wasConnected) {
      // Just disconnected — tear everything down.
      stopRealtime();
    }
    return () => {
      if (status === "connected") stopRealtime();
    };
    // provider intentionally included so Freighter reconnects also trigger sync
  }, [status, provider]);
}

/** Force-refresh balances right now (e.g. after a confirmed transaction). */
export { refreshBalancesNow as refreshNow };

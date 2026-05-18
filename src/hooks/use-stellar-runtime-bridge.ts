import { useEffect } from "react";
import { invalidateHorizonClient } from "@/lib/stellar/client";
import { refreshBalancesNow, startRealtime, stopRealtime } from "@/realtime";
import { useStellarRuntimeStore } from "@/store/stellar-runtime.store";
import { useWalletStore } from "@/store/wallet.store";

/**
 * Invalidate Horizon singleton + restart balance/tx watchers when operators flip ledgers mid-session.
 */
export function useStellarRuntimeBridge() {
  const userNetworkOverride = useStellarRuntimeStore((s) => s.userNetworkOverride);

  useEffect(() => {
    invalidateHorizonClient();
    if (useWalletStore.getState().status !== "connected") return undefined;
    stopRealtime();
    const t = window.setTimeout(() => {
      void refreshBalancesNow();
      startRealtime();
    }, 0);
    return () => window.clearTimeout(t);
  }, [userNetworkOverride]);
}

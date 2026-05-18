/**
 * Hook for USDC trustline status on the connected wallet.
 * Returns { status, check, addUsdc } where status is:
 *   "unknown" | "loading" | "has-usdc" | "no-usdc" | "no-account" | "not-freighter"
 */

import { useState, useCallback } from "react";
import { checkTrustlines, addUsdcTrustline } from "@/lib/stellar/trustlines";
import { useWalletStore } from "@/store/wallet.store";
import { useNotificationsStore } from "@/store/notifications.store";

export type TrustlineStatus =
  | "unknown"
  | "loading"
  | "has-usdc"
  | "no-usdc"
  | "no-account"
  | "not-freighter";

export function useTrustline() {
  const [status, setStatus] = useState<TrustlineStatus>("unknown");
  const push = useNotificationsStore((s) => s.push);

  const check = useCallback(async () => {
    const { account } = useWalletStore.getState();
    if (!account) return;
    if (account.provider !== "freighter") {
      setStatus("not-freighter");
      return;
    }
    setStatus("loading");
    try {
      const tl = await checkTrustlines(account.publicKey);
      setStatus(tl.usdc ? "has-usdc" : "no-usdc");
    } catch {
      setStatus("no-account");
    }
  }, []);

  const addUsdc = useCallback(async () => {
    const { account } = useWalletStore.getState();
    if (!account) return;
    const toastId = push({
      tone: "loading",
      title: "Adding USDC trustline…",
      description: "Sign in Freighter when prompted",
      duration: 0,
    });
    const result = await addUsdcTrustline(account.publicKey);
    useNotificationsStore.getState().dismiss(toastId);
    if (result.ok) {
      setStatus("has-usdc");
      push({ tone: "success", title: "USDC trustline added", duration: 4000 });
    } else {
      push({ tone: "error", title: "Trustline failed", description: result.error, duration: 6000 });
    }
  }, [push]);

  return { status, check, addUsdc };
}

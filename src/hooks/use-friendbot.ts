/**
 * Hook for funding the connected testnet account via Friendbot.
 */

import { useState, useCallback } from "react";
import { fundWithFriendbot } from "@/lib/stellar/friendbot";
import { useWalletStore } from "@/store/wallet.store";
import { useNotificationsStore } from "@/store/notifications.store";
import { activeIsTestnet } from "@/lib/stellar/config";
import { refreshBalancesNow } from "@/realtime/balance-sync";

export type FundbotState = "idle" | "loading" | "success" | "error";

export function useFriendbot() {
  const [state, setState] = useState<FundbotState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const push = useNotificationsStore((s) => s.push);

  const fund = useCallback(async () => {
    const { account } = useWalletStore.getState();
    if (!account || !activeIsTestnet()) return;
    setState("loading");
    setMessage(null);

    const toastId = push({
      tone: "loading",
      title: "Requesting testnet XLM…",
      description: "Friendbot is funding your account",
      duration: 0,
    });

    const result = await fundWithFriendbot(account.publicKey);
    useNotificationsStore.getState().dismiss(toastId);

    if (result.funded) {
      setState("success");
      setMessage(result.hash ?? "Account funded");
      push({
        tone: "success",
        title: "10,000 XLM received from Friendbot",
        description: result.hash ? `Tx: 0x${result.hash.slice(0, 8)}…` : undefined,
        duration: 5000,
      });
      // Refresh balances so the UI updates.
      setTimeout(refreshBalancesNow, 2000);
    } else {
      setState("error");
      setMessage(result.error ?? "Failed to fund");
      push({
        tone: "warning",
        title: "Friendbot failed",
        description: result.error,
        duration: 6000,
      });
    }
  }, [push]);

  return { state, message, fund, canFund: activeIsTestnet() };
}

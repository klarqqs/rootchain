/**
 * Public hook for the entire wallet lifecycle.
 *
 * Pages and components should ONLY interact with the wallet through here.
 * - Reads come straight from Zustand selectors (no rerender churn).
 * - Writes go through the wallet service so we keep one source of truth.
 */

import { useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useWalletStore } from "@/store/wallet.store";
import { useNotificationsStore } from "@/store/notifications.store";
import { walletService } from "@/services";
import { updateProfileWalletAddress } from "@/database/services/profile.service";
import { isRealSigningProvider } from "@/lib/stellar/wallet-signer";
import { useIdentityStore } from "@/store/identity.store";
import { startRealtime, stopRealtime } from "@/realtime";
import type { WalletProviderId } from "@/types/wallet";
import { truncateAddr } from "@/lib/utils";

async function syncProfileWallet(publicKey: string | null): Promise<void> {
  const uid = useIdentityStore.getState().session?.user?.id;
  if (!uid) return;
  await updateProfileWalletAddress(uid, publicKey);
}

export function useWallet() {
  const {
    status,
    account,
    balances,
    totalUsd,
    isHydrated,
    lastError,
    setConnecting,
    setConnected,
    setError,
    setBalances,
  } = useWalletStore(
    useShallow((s) => ({
      status: s.status,
      account: s.account,
      balances: s.balances,
      totalUsd: s.totalUsd,
      isHydrated: s.isHydrated,
      lastError: s.lastError,
      setConnecting: s.setConnecting,
      setConnected: s.setConnected,
      setError: s.setError,
      setBalances: s.setBalances,
    })),
  );

  const pushToast = useNotificationsStore((s) => s.push);
  const reconnectAttempted = useRef(false);

  /** Reconnect on first mount if we have a persisted real wallet session. */
  useEffect(() => {
    if (!isHydrated || reconnectAttempted.current) return;
    reconnectAttempted.current = true;

    if (
      account &&
      isRealSigningProvider(account.provider) &&
      status === "connected"
    ) {
      walletService.reconnect(account.provider).then((res) => {
        if (res.ok) {
          setConnected(res.value.account, res.value.balances);
          void syncProfileWallet(res.value.account.publicKey);
        }
      });
    }
  }, [isHydrated, account, status, setConnected]);

  const connect = useCallback(
    async (provider: WalletProviderId) => {
      setConnecting();
      const res = await walletService.connect(provider);
      if (!res.ok) {
        setError(res.error.message);
        pushToast({
          tone: "error",
          title: "Wallet connection failed",
          description: res.error.message,
          duration: 6000,
        });
        return false;
      }
      setConnected(res.value.account, res.value.balances);
      startRealtime();
      await syncProfileWallet(res.value.account.publicKey);
      pushToast({
        tone: "success",
        title: `${res.value.account.label ?? provider} connected`,
        description: truncateAddr(res.value.account.publicKey),
        duration: 4000,
      });
      return true;
    },
    [pushToast, setConnected, setConnecting, setError],
  );

  const disconnectWallet = useCallback(async () => {
    stopRealtime();
    const res = await walletService.disconnectWallet();
    if (!res.ok) {
      pushToast({
        tone: "error",
        title: "Could not disconnect wallet",
        description: res.error.message,
        duration: 5000,
      });
      return false;
    }
    await syncProfileWallet(null);
    pushToast({
      tone: "info",
      title: "Wallet disconnected",
      duration: 3000,
    });
    return true;
  }, [pushToast]);

  const refresh = useCallback(async () => {
    if (!account) return;
    const res = await walletService.refreshBalances(account);
    if (res.ok) setBalances(res.value);
  }, [account, setBalances]);

  return {
    status,
    isConnected: status === "connected" && !!account,
    isConnecting: status === "connecting",
    account,
    balances,
    totalUsd,
    lastError,
    connect,
    disconnect: disconnectWallet,
    disconnectWallet,
    refresh,
  };
}

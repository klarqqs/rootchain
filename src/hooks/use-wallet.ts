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
import { userService } from "@/database";
import { updateAppProfile } from "@/services/auth-session.service";
import { useIdentityStore } from "@/store/identity.store";
import { startRealtime, stopRealtime } from "@/realtime";
import type { WalletProviderId } from "@/types/wallet";
import { truncateAddr } from "@/lib/utils";

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
    setDisconnected,
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
      setDisconnected: s.setDisconnected,
      setError: s.setError,
      setBalances: s.setBalances,
    })),
  );

  const pushToast = useNotificationsStore((s) => s.push);
  const reconnectAttempted = useRef(false);

  /** Reconnect on first mount if we have persisted state. */
  useEffect(() => {
    if (!isHydrated || reconnectAttempted.current) return;
    reconnectAttempted.current = true;

    if (account?.provider === "freighter" && status === "connected") {
      walletService.reconnect("freighter").then((res) => {
        if (res.ok) {
          setConnected(res.value.account, res.value.balances);
        }
        // Silent failure — keep persisted UI until user reconnects.
      });
    }
  }, [isHydrated, account?.provider, status, setConnected]);

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
      // Phase 3: kick off live Horizon sync and persist user profile.
      startRealtime();
      userService.upsertUser(res.value.account.publicKey).catch(() => {
        // Non-fatal — DB might not be configured.
      });
      const uid = useIdentityStore.getState().session?.user?.id;
      if (uid) {
        void updateAppProfile(uid, { wallet_public_key: res.value.account.publicKey }).catch(() => {
          /* profile row may still be provisioning */
        });
      }
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

  const disconnect = useCallback(async () => {
    stopRealtime();
    await walletService.disconnect();
    setDisconnected();
    pushToast({
      tone: "info",
      title: "Wallet disconnected",
      duration: 3000,
    });
  }, [pushToast, setDisconnected]);

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
    disconnect,
    refresh,
  };
}

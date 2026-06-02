/**
 * Live balance synchronisation with Stellar Horizon.
 *
 * Polls Horizon for connected real wallets (Freighter + LOBSTR).
 */

import { fetchAccountBalances } from "@/lib/stellar/account";
import { useWalletStore } from "@/store/wallet.store";
import { isRealSigningProvider } from "@/lib/stellar/wallet-signer";
import { createPoller, type Poller } from "./poller";

const env = import.meta.env;
const INTERVAL_MS = Number(env.VITE_BALANCE_POLL_MS ?? 12_000);

let activeSync: Poller | null = null;

async function doSync() {
  const { status, account, setBalances } = useWalletStore.getState();
  if (status !== "connected" || !account) return;
  if (!isRealSigningProvider(account.provider)) return;

  try {
    const balances = await fetchAccountBalances(account.publicKey);
    setBalances(balances);
  } catch {
    // Horizon unreachable — keep last known on-chain snapshot.
  }
}

export function startBalanceSync() {
  stopBalanceSync();
  activeSync = createPoller({ intervalMs: INTERVAL_MS, fireImmediately: true, fn: doSync });
  activeSync.start();
}

export function stopBalanceSync() {
  activeSync?.stop();
  activeSync = null;
}

export function refreshBalancesNow() {
  void doSync();
}

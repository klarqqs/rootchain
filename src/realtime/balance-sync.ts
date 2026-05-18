/**
 * Live balance synchronisation with Stellar Horizon.
 *
 * When a Freighter wallet is connected we poll Horizon every
 * VITE_BALANCE_POLL_MS (default 12s). Non-Freighter providers fall back to
 * mock balances which remain up-to-date via local `adjustBalance()` calls.
 *
 * Usage:
 *   const sync = createBalanceSync();
 *   sync.start();    // Call once after wallet connects
 *   sync.stop();     // Call on disconnect or unmount
 */

import { fetchAccountBalances } from "@/lib/stellar/account";
import { useWalletStore } from "@/store/wallet.store";
import { createPoller, type Poller } from "./poller";

const env = import.meta.env;
const INTERVAL_MS = Number(env.VITE_BALANCE_POLL_MS ?? 12_000);

let activeSync: Poller | null = null;

async function doSync() {
  const { status, account, setBalances } = useWalletStore.getState();
  if (status !== "connected" || !account) return;
  if (account.provider !== "freighter") return; // only Freighter has real on-chain data

  try {
    const balances = await fetchAccountBalances(account.publicKey);
    setBalances(balances);
  } catch {
    // Horizon unreachable — keep existing balances.
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

/** Force a single immediate refresh (e.g. after a confirmed tx). */
export function refreshBalancesNow() {
  doSync();
}

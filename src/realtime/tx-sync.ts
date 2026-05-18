/**
 * Live transaction history sync from Stellar Horizon.
 *
 * Two modes:
 *   1. SSE stream (via Horizon.Server.stream)  — real-time push
 *   2. Polling fallback via createPoller       — periodic fetch
 *
 * When both are active the stream handles incoming txs and polling
 * reconciles any gaps. Non-Freighter wallets skip Horizon calls.
 */

import {
  fetchAccountTxHistory,
  streamAccountTransactions,
} from "@/lib/stellar/horizon-watcher";
import { useWalletStore } from "@/store/wallet.store";
import { useTransactionsStore } from "@/store/transactions.store";
import { createPoller } from "./poller";

const env = import.meta.env;
const POLL_MS = Number(env.VITE_TX_POLL_MS ?? 20_000);

type StopFn = () => void;
let stopStream: StopFn | null = null;
let stopPoll: StopFn | null = null;

/** Pull recent history once and upsert any new records. */
async function fetchAndMerge(publicKey: string) {
  try {
    const records = await fetchAccountTxHistory(publicKey, { limit: 15 });
    const { upsert } = useTransactionsStore.getState();
    for (const r of records) {
      // Only upsert if we don't already have a more detailed local record.
      const existing = useTransactionsStore.getState().records.find((x) => x.hash === r.hash);
      if (!existing) upsert(r);
    }
  } catch {
    // Horizon unreachable — skip silently.
  }
}

export function startTxSync() {
  stopTxSync();

  const { account } = useWalletStore.getState();
  if (!account || account.provider !== "freighter") return;
  const publicKey = account.publicKey;

  // Initial fetch
  fetchAndMerge(publicKey);

  // SSE stream for live updates
  try {
    const { upsert } = useTransactionsStore.getState();
    stopStream = streamAccountTransactions(publicKey, (record) => {
      const existing = useTransactionsStore.getState().records.find((r) => r.hash === record.hash);
      if (!existing) upsert(record);
    });
  } catch {
    // SSE not available — polling handles it.
    stopStream = null;
  }

  // Polling fallback
  const poller = createPoller({
    intervalMs: POLL_MS,
    fn: () => fetchAndMerge(publicKey),
  });
  poller.start();
  stopPoll = poller.stop;
}

export function stopTxSync() {
  stopStream?.();
  stopStream = null;
  stopPoll?.();
  stopPoll = null;
}

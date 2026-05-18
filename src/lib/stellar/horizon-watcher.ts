/**
 * Horizon account watcher + transaction history fetcher.
 *
 * Two data fetching strategies for Phase 3:
 *   1. fetchAccountBalances  — already in account.ts; re-exported from index.
 *   2. fetchAccountTxHistory — real Horizon tx records for the wallet page.
 *   3. streamAccountPayments — SSE-based live feed (calls back on each event).
 *
 * All calls are testnet-routed through the singleton horizon() client.
 */

import type { Horizon as HorizonNS } from "@stellar/stellar-sdk";
import { horizon } from "./client";
import type { TxRecord } from "@/types/transaction";

export type HorizonTx = HorizonNS.ServerApi.TransactionRecord;

// ─── Transaction history ─────────────────────────────────────────────────────

export interface FetchHistoryOpts {
  limit?: number;
  cursor?: string;
}

/**
 * Pull the most recent `limit` transactions for an account from Horizon.
 * Returns normalised TxRecord objects so the existing UI can render them.
 */
export async function fetchAccountTxHistory(
  publicKey: string,
  opts: FetchHistoryOpts = {},
): Promise<TxRecord[]> {
  const limit = opts.limit ?? 20;

  let builder = horizon()
    .transactions()
    .forAccount(publicKey)
    .order("desc")
    .limit(limit);

  if (opts.cursor) {
    builder = builder.cursor(opts.cursor);
  }

  const page = await builder.call();
  return page.records.map(normalizeTx);
}

/** Convert a raw Horizon transaction record into our internal TxRecord shape. */
function normalizeTx(tx: HorizonTx): TxRecord {
  // Determine kind from memo / operations — default to TRANSFER for simplicity.
  // Phase 4 will parse the operation type more precisely.
  const kind = detectKind(tx.memo ?? "");

  return {
    hash: tx.hash,
    kind,
    status: tx.successful ? "confirmed" : "failed",
    amount: Number(tx.fee_charged) / 10_000_000, // fee as a proxy; real amount in ops
    fee: Number(tx.fee_charged) / 10_000_000,
    confirmations: tx.successful ? 5 : 0,
    ledger: tx.ledger_attr,
    memo: typeof tx.memo === "string" ? tx.memo : undefined,
    createdAt: new Date(tx.created_at).getTime(),
    settledAt: new Date(tx.created_at).getTime(),
  };
}

/** Cheap heuristic to classify a tx kind from its memo. */
function detectKind(memo: string): TxRecord["kind"] {
  const m = memo.toLowerCase();
  if (m.includes("invest")) return "INVEST";
  if (m.includes("claim")) return "CLAIM";
  if (m.includes("deposit")) return "DEPOSIT";
  if (m.includes("withdraw")) return "WITHDRAW";
  return "TRANSFER";
}

// ─── Streaming ───────────────────────────────────────────────────────────────

type StreamHandler = (tx: TxRecord) => void;
type StopStream = () => void;

/**
 * Open an SSE stream for incoming payments on `publicKey`.
 * Calls `onTx` for each new transaction.
 * Returns a teardown function that closes the stream.
 */
export function streamAccountTransactions(
  publicKey: string,
  onTx: StreamHandler,
): StopStream {
  // The SDK's stream() returns a close function.
  const close = horizon()
    .transactions()
    .forAccount(publicKey)
    .order("asc")
    .cursor("now")
    .stream({
      onmessage: (tx) => {
        onTx(normalizeTx(tx as HorizonTx));
      },
      onerror: () => {
        // Silently ignore stream errors; polling acts as fallback.
      },
    });

  return close;
}

// ─── Account existence check ─────────────────────────────────────────────────

/** Returns true if the account exists on Horizon (i.e. has been funded). */
export async function accountExists(publicKey: string): Promise<boolean> {
  try {
    await horizon().loadAccount(publicKey);
    return true;
  } catch {
    return false;
  }
}

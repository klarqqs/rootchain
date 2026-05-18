/**
 * Transaction simulation engine.
 *
 * Drives the lifecycle:
 *   building → signing → broadcasting → pending (1..5 confirmations) → confirmed
 *
 * Every state change emits to the `txStore` so the UI can subscribe without
 * caring whether we're hitting Stellar or a stub. When Phase 3 swaps in
 * real Horizon submissions, only this file needs to change.
 */

import type { TxKind, TxRecord } from "@/types/transaction";
import { generateStellarHash, nextLedger } from "@/utils/hash";

const env = import.meta.env;
const TX_CONFIRM_DELAY_MS = Number(env.VITE_TX_CONFIRM_DELAY_MS ?? 2200);

export interface SimulateTxInput {
  kind: TxKind;
  amount: number;
  produceId?: string;
  produceName?: string;
  counterparty?: string;
  memo?: string;
  receivedAsset?: { symbol: string; amount: number };
  /** Merged into every lifecycle emission (presentation fields, chain XLM hints, …). */
  recordExtras?: Partial<TxRecord>;
}

export type TxLifecycleListener = (record: TxRecord) => void;

const STELLAR_BASE_FEE_XLM = 0.00001; // base fee on stellar
const TARGET_CONFIRMATIONS = 5;

/**
 * Build an initial pending TxRecord.
 * Listeners get called every state transition, so the UI can render
 * a spinner → checkmark → final state without polling.
 */
export function simulateTx(
  input: SimulateTxInput,
  onUpdate: TxLifecycleListener,
): { hash: string; cancel: () => void } {
  const hash = generateStellarHash();
  const startedAt = Date.now();
  const extras = input.recordExtras ?? {};

  const mk = (patch: Partial<TxRecord>): TxRecord => ({
    hash,
    kind: input.kind,
    status: "building",
    amount: input.amount,
    receivedAsset: input.receivedAsset,
    produceId: input.produceId,
    produceName: input.produceName,
    counterparty: input.counterparty,
    memo: input.memo,
    fee: STELLAR_BASE_FEE_XLM,
    confirmations: 0,
    createdAt: startedAt,
    settledAt: null,
    ...extras,
    ...patch,
  });

  onUpdate(mk({ status: "building" }));

  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];

  const schedule = (ms: number, fn: () => void) => {
    const id = setTimeout(() => {
      if (!cancelled) fn();
    }, ms);
    timers.push(id);
  };

  // building → signing
  schedule(180, () => {
    onUpdate(mk({ status: "signing" }));
  });

  // signing → broadcasting
  schedule(440, () => {
    onUpdate(mk({ status: "broadcasting" }));
  });

  // broadcasting → pending (1st conf)
  schedule(720, () => {
    onUpdate(mk({ status: "pending", confirmations: 1 }));
  });

  // pending: 1..TARGET_CONFIRMATIONS
  for (let c = 2; c <= TARGET_CONFIRMATIONS; c++) {
    schedule(720 + (TX_CONFIRM_DELAY_MS / TARGET_CONFIRMATIONS) * (c - 1), () => {
      onUpdate(mk({ status: "pending", confirmations: c }));
    });
  }

  // confirmed
  schedule(720 + TX_CONFIRM_DELAY_MS, () => {
    onUpdate(
      mk({
        status: "confirmed",
        confirmations: TARGET_CONFIRMATIONS,
        ledger: nextLedger(),
        settledAt: Date.now(),
      }),
    );
  });

  return {
    hash,
    cancel: () => {
      cancelled = true;
      for (const id of timers) clearTimeout(id);
    },
  };
}

/**
 * Build a ledger-explorer-style receipt label, e.g. "INVEST · RC-0421".
 */
export function describeTx(record: TxRecord): string {
  if (record.produceId) return `${record.kind} · ${record.produceId}`;
  if (record.counterparty) return `${record.kind} → ${record.counterparty.slice(0, 6)}…`;
  return record.kind;
}

/** True while the tx is still propagating. */
export const isTxPending = (s: TxRecord["status"]) =>
  s === "building" || s === "signing" || s === "broadcasting" || s === "pending";

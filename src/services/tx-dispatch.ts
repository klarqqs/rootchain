/**
 * Transaction dispatch — Phase 3's routing layer.
 *
 * Decision matrix:
 *   • Freighter connected → executeRealTx() → Stellar testnet
 *   • Any other provider  → simulateTx()    → local simulation (same UX)
 *
 * Both paths converge on the TxRecord lifecycle, so the UI never changes.
 * Swapping simulation for real is a one-line env change when mainnet launches.
 */

import type { TxKind, TxPaymentPresentation } from "@/types/transaction";
import { simulateTx, type SimulateTxInput } from "./transaction-engine";
import { executeRealTx, USDC_XLM_RATE, type RealTxInput } from "@/lib/stellar/tx-executor";
import { XLM_USD_PRICE_ESTIMATE } from "@/lib/stellar/account";
import { useWalletStore } from "@/store/wallet.store";
import { requiresRealLedgerSettlement } from "@/lib/platform-mode";
import type { TxRecord } from "@/types/transaction";

export type DispatchListener = (record: TxRecord) => void;

export interface DispatchInput {
  kind: TxKind;
  /** Primary amount: USD notional (invest / deposit) or native XLM (peer send). */
  amount: number;
  paymentPresentation?: TxPaymentPresentation;
  produceId?: string;
  produceName?: string;
  counterparty?: string;
  memo?: string;
  receivedAsset?: { symbol: string; amount: number };
}

export interface DispatchHandle {
  hash: string;
  finalized: Promise<TxRecord>;
  cancel: () => void;
  isReal: boolean;
}

/** Determine if the currently connected wallet supports real Stellar txs. */
export function canExecuteReal(): boolean {
  const { status, account } = useWalletStore.getState();
  return status === "connected" && account?.provider === "freighter";
}

/**
 * Dispatch a transaction through the appropriate path.
 * Returns immediately with a handle containing the (provisional) hash
 * and a `finalized` promise that resolves to the settled TxRecord.
 */
function settlementBlockedHandle(kind: TxKind, amount: number, message: string): DispatchHandle {
  const failed: TxRecord = {
    hash: "blocked",
    kind,
    status: "failed",
    amount,
    fee: 0,
    confirmations: 0,
    memo: message,
    createdAt: Date.now(),
    settledAt: Date.now(),
  };
  return {
    hash: failed.hash,
    isReal: false,
    cancel: () => undefined,
    finalized: Promise.resolve(failed),
  };
}

export function dispatchTx(
  input: DispatchInput,
  onUpdate?: DispatchListener,
): DispatchHandle {
  const isReal = canExecuteReal();

  if (requiresRealLedgerSettlement() && !isReal) {
    const msg =
      "Connect Freighter on the same ledger as ROOTCHAIN to move real funds. Simulated wallet providers are disabled in production mode.";
    onUpdate?.({
      hash: "blocked",
      kind: input.kind,
      status: "failed",
      amount: input.amount,
      fee: 0,
      confirmations: 0,
      memo: msg,
      createdAt: Date.now(),
      settledAt: Date.now(),
    });
    return settlementBlockedHandle(input.kind, input.amount, msg);
  }

  if (isReal) {
    return dispatchRealTx(input, onUpdate);
  }
  return dispatchSimulatedTx(input, onUpdate);
}

function simExtras(input: DispatchInput): Partial<TxRecord> {
  const pres = input.paymentPresentation ?? "usd_notional";
  const chainXlm = pres === "native_xlm" ? input.amount : input.amount / USDC_XLM_RATE;
  if (pres === "native_xlm") {
    return {
      paymentPresentation: "native_xlm",
      chainAmountXlm: input.amount,
      usdNotional: input.amount * XLM_USD_PRICE_ESTIMATE,
    };
  }
  return {
    paymentPresentation: "usd_notional",
    chainAmountXlm: chainXlm,
    usdNotional: input.amount,
  };
}

// ─── Real Stellar path ────────────────────────────────────────────────────────

function dispatchRealTx(
  input: DispatchInput,
  onUpdate?: DispatchListener,
): DispatchHandle {
  const { account } = useWalletStore.getState();
  const publicKey = account!.publicKey;

  const pres = input.paymentPresentation ?? "usd_notional";
  const chainXlm = pres === "native_xlm" ? input.amount : input.amount / USDC_XLM_RATE;
  const xlmAmount = chainXlm.toFixed(7);

  const realInput: RealTxInput = {
    kind: input.kind,
    sourcePublicKey: publicKey,
    destinationPublicKey:
      input.kind === "TRANSFER" && input.counterparty ? input.counterparty : "escrow",
    asset: "XLM",
    amount: xlmAmount,
    memo: input.memo ?? input.produceId,
    paymentPresentation: pres,
    usdIntentUsd: pres === "usd_notional" ? input.amount : undefined,
  };

  let resolveFinal!: (r: TxRecord) => void;
  const finalized = new Promise<TxRecord>((res) => {
    resolveFinal = res;
  });

  let finalRecord: TxRecord | null = null;

  void executeRealTx(realInput, (record) => {
    const enriched: TxRecord = {
      ...record,
      produceId: input.produceId,
      produceName: input.produceName,
      counterparty: input.counterparty,
      receivedAsset: input.receivedAsset,
    };
    finalRecord = enriched;
    onUpdate?.(enriched);
    if (record.status === "confirmed" || record.status === "failed") {
      resolveFinal(enriched);
    }
  });

  return {
    hash: "pending-real",
    finalized,
    isReal: true,
    cancel: () => {
      if (finalRecord && !["confirmed", "failed"].includes(finalRecord.status)) {
        const cancelled: TxRecord = {
          ...finalRecord,
          status: "failed",
          memo: "Cancelled before broadcast",
          settledAt: Date.now(),
        };
        resolveFinal(cancelled);
      }
    },
  };
}

// ─── Simulation path ──────────────────────────────────────────────────────────

function dispatchSimulatedTx(
  input: DispatchInput,
  onUpdate?: DispatchListener,
): DispatchHandle {
  const simInput: SimulateTxInput = {
    kind: input.kind,
    amount: input.amount,
    produceId: input.produceId,
    produceName: input.produceName,
    counterparty: input.counterparty,
    memo: input.memo,
    receivedAsset: input.receivedAsset,
    recordExtras: simExtras(input),
  };

  let resolveFinal!: (r: TxRecord) => void;
  const finalized = new Promise<TxRecord>((res) => {
    resolveFinal = res;
  });

  const sim = simulateTx(simInput, (record) => {
    onUpdate?.(record);
    if (record.status === "confirmed" || record.status === "failed") {
      resolveFinal(record);
    }
  });

  return {
    hash: sim.hash,
    finalized,
    isReal: false,
    cancel: () => {
      sim.cancel();
    },
  };
}

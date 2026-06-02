/**
 * Transaction dispatch — real Stellar ledger only.
 *
 * Requires a connected Freighter or LOBSTR wallet. No simulated balances or
 * fake transaction hashes are generated.
 */

import type { TxKind, TxPaymentPresentation } from "@/types/transaction";
import { executeRealTx, USDC_XLM_RATE, type RealTxInput } from "@/lib/stellar/tx-executor";
import { XLM_USD_PRICE_ESTIMATE } from "@/lib/stellar/account";
import { activeIsPublicNetwork } from "@/lib/stellar/effective-network";
import { useWalletStore } from "@/store/wallet.store";
import { isRealSigningProvider } from "@/lib/stellar/wallet-signer";
import type { TxRecord } from "@/types/transaction";

export type DispatchListener = (record: TxRecord) => void;

export interface DispatchInput {
  kind: TxKind;
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

export function canExecuteReal(): boolean {
  const { status, account } = useWalletStore.getState();
  return status === "connected" && !!account && isRealSigningProvider(account.provider);
}

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

export function dispatchTx(input: DispatchInput, onUpdate?: DispatchListener): DispatchHandle {
  if (!canExecuteReal()) {
    const msg = "Connect Freighter or LOBSTR on Stellar Mainnet to move funds.";
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

  return dispatchRealTx(input, onUpdate);
}

function dispatchRealTx(input: DispatchInput, onUpdate?: DispatchListener): DispatchHandle {
  const { account } = useWalletStore.getState();
  const publicKey = account!.publicKey;

  const pres = input.paymentPresentation ?? "usd_notional";
  const useUsdc =
    activeIsPublicNetwork() &&
    (input.kind === "INVEST" || input.kind === "DEPOSIT" || pres === "usd_notional");

  const chainXlm = pres === "native_xlm" ? input.amount : input.amount / USDC_XLM_RATE;
  const amountStr = useUsdc
    ? input.amount.toFixed(7).replace(/\.?0+$/, "") || "0.0000001"
    : chainXlm.toFixed(7);

  const realInput: RealTxInput = {
    kind: input.kind,
    sourcePublicKey: publicKey,
    destinationPublicKey:
      input.kind === "TRANSFER" && input.counterparty ? input.counterparty : "escrow",
    asset: useUsdc ? "USDC" : "XLM",
    amount: amountStr,
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
      usdNotional:
        record.usdNotional ??
        (pres === "usd_notional" ? input.amount : input.amount * XLM_USD_PRICE_ESTIMATE),
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

/**
 * Transaction service — Phase 3 upgrade.
 *
 * All public functions now route through `tx-dispatch.ts` which decides:
 *   Freighter connected → executeRealTx() (real Stellar testnet)
 *   Any other provider  → simulateTx()   (local simulation)
 *
 * The API surface is unchanged; callers get the same handle shape.
 */

import type { TxKind, TxPaymentPresentation, TxRecord } from "@/types/transaction";
import { isTxPending } from "./transaction-engine";
import { dispatchTx, canExecuteReal, type DispatchInput } from "./tx-dispatch";
import { useTransactionsStore } from "@/store/transactions.store";
import { useWalletStore } from "@/store/wallet.store";
import { useNotificationsStore } from "@/store/notifications.store";
import { useActivityFeedStore } from "@/store/activity-feed.store";
import { shortHash } from "@/utils/hash";
import { validateDispatchInput } from "@/lib/security/tx-validation";
import { assertClientRateLimit, ClientRateLimitError } from "@/lib/security/rate-limit";
import { refreshBalancesNow } from "@/realtime";
import { persistTxMetadata } from "@/database/services/investment.service";

export interface TxHandle {
  hash: string;
  cancel: () => void;
  finalized: Promise<TxRecord>;
  isReal: boolean;
}

interface InvestArgs {
  produceId: string;
  produceName: string;
  amount: number;
  shares: number;
  expectedRoi: number;
}

interface TransferArgs {
  destination: string;
  amount: number;
  memo?: string;
  paymentPresentation?: TxPaymentPresentation;
}

interface DepositArgs {
  amount: number;
  memo?: string;
}

interface ClaimArgs {
  produceId: string;
  produceName: string;
  amount: number;
}

function syntheticFailedTx(
  kind: TxKind,
  input: Omit<DispatchInput, "kind">,
  memo: string,
): TxRecord {
  const amt = typeof input.amount === "number" && Number.isFinite(input.amount) ? input.amount : 0;
  const hash = `ff${`${Date.now().toString(16)}${memo.length}`.padEnd(62, "0").slice(0, 62)}`;
  return {
    hash,
    kind,
    status: "failed",
    amount: amt,
    produceId: input.produceId,
    produceName: input.produceName,
    memo,
    counterparty: input.counterparty,
    fee: 0,
    confirmations: 0,
    createdAt: Date.now(),
    settledAt: Date.now(),
  };
}

/**
 * Core orchestrator — wraps dispatch with toast management + store updates.
 * Every public submit* function calls this.
 */
export function submitTransaction(
  kind: TxKind,
  input: Omit<DispatchInput, "kind">,
  onSettle?: (record: TxRecord, ctx: { ledgerExecution: boolean }) => void,
): TxHandle {
  const { upsert, setSpotlight } = useTransactionsStore.getState();
  const { push: pushToast, update: updateToast, dismiss } = useNotificationsStore.getState();

  try {
    validateDispatchInput(kind, { kind, ...input } as DispatchInput);
    const pk = useWalletStore.getState().account?.publicKey ?? "guest";
    assertClientRateLimit(`dispatch:${pk}`, 12, 60_000);
  } catch (err) {
    const message =
      err instanceof ClientRateLimitError || err instanceof Error
        ? (err as Error).message
        : "Validation failed.";
    pushToast({
      tone: "error",
      title: "Transaction blocked",
      description: message,
      duration: 6000,
    });
    const failed = syntheticFailedTx(kind, input, message);
    upsert(failed);
    setSpotlight(failed.hash);
    onSettle?.(failed, { ledgerExecution: false });
    return {
      hash: failed.hash,
      isReal: false,
      finalized: Promise.resolve(failed),
      cancel: () => {},
    };
  }

  const toastId = pushToast({
    tone: "loading",
    title: "Submitting transaction…",
    description: "Awaiting on-chain confirmation",
    duration: 0,
  });

  let latestRecord: TxRecord | null = null;

  /** Snapshot at submission time — must match routing inside dispatchTx. */
  const ledgerExecutionPath = canExecuteReal();

  const handle = dispatchTx({ kind, ...input }, (record) => {
    latestRecord = record;
    upsert(record);
    setSpotlight(record.hash);

    if (record.status === "broadcasting" || (record.status === "pending" && record.confirmations === 1)) {
      updateToast(toastId, {
        title: ledgerExecutionPath ? "Broadcasted to Stellar testnet" : "Transaction broadcasted",
        description: shortHash(record.hash),
        tone: "info",
      });
    }

    if (record.status === "confirmed") {
      dismiss(toastId);
      pushToast({
        tone: "success",
        title: `${kind} confirmed${ledgerExecutionPath ? " on Stellar" : ""}`,
        description: shortHash(record.hash),
        duration: 5000,
        meta: { txHash: record.hash },
      });

      if (ledgerExecutionPath) {
        refreshBalancesNow();
        const pk = useWalletStore.getState().account?.publicKey ?? null;
        if (pk) {
          const amountForDb =
            record.paymentPresentation === "native_xlm" ? (record.usdNotional ?? null) : record.amount;
          void persistTxMetadata(pk, record.hash, kind, amountForDb, record.produceId, record.memo);
        }
      }

      useActivityFeedStore.getState().push(
        kind === "INVEST"
          ? {
              category: "invest",
              tone: "success",
              title: record.produceName
                ? `Ownership recorded · ${record.produceName}`
                : `Investment escrow locked`,
              body: `${ledgerExecutionPath ? "Anchored on Stellar (testnet)" : "Settlement simulated"} · ${shortHash(record.hash)}`,
              meta: { txHash: record.hash, produceId: record.produceId },
            }
          : kind === "CLAIM"
            ? {
                category: "distribution",
                tone: "success",
                title: "Yield distribution posted",
                body: `Harvest proceeds routed to wallet · ${shortHash(record.hash)}`,
                meta: { txHash: record.hash, produceId: record.produceId },
              }
            : {
                category: "txn",
                tone: "success",
                title: `${kind} confirmed`,
                body: `${record.memo ?? `${kind}`} · ${shortHash(record.hash)}`,
                meta: { txHash: record.hash, produceId: record.produceId },
              },
      );

      onSettle?.(record, { ledgerExecution: ledgerExecutionPath });
    }

    if (record.status === "failed") {
      dismiss(toastId);
      pushToast({
        tone: "error",
        title: `${kind} failed`,
        description: record.memo ?? "Transaction reverted",
        duration: 6000,
      });
      onSettle?.(record, { ledgerExecution: ledgerExecutionPath });
    }
  });

  return {
    hash: handle.hash,
    isReal: handle.isReal,
    finalized: handle.finalized,
    cancel: () => {
      handle.cancel();
      if (latestRecord && isTxPending(latestRecord.status)) {
        const cancelled: TxRecord = {
          ...latestRecord,
          status: "failed",
          memo: "Cancelled by user",
          settledAt: Date.now(),
        };
        upsert(cancelled);
        dismiss(toastId);
      }
    },
  };
}

export function submitInvestment(args: InvestArgs): TxHandle {
  const { adjustBalance } = useWalletStore.getState();
  return submitTransaction(
    "INVEST",
    {
      amount: args.amount,
      produceId: args.produceId,
      produceName: args.produceName,
      receivedAsset: { symbol: "RCSHARE", amount: args.shares },
    },
    (record, ctx) => {
      if (record.status !== "confirmed" || ctx.ledgerExecution) return;
      adjustBalance("USDC", -args.amount);
      adjustBalance("RCSHARE", args.shares);
    },
  );
}

export function submitClaim(args: ClaimArgs): TxHandle {
  const { adjustBalance } = useWalletStore.getState();
  return submitTransaction(
    "CLAIM",
    {
      amount: args.amount,
      produceId: args.produceId,
      produceName: args.produceName,
    },
    (record, ctx) => {
      if (record.status !== "confirmed" || ctx.ledgerExecution) return;
      adjustBalance("USDC", args.amount);
    },
  );
}

export function submitTransfer(args: TransferArgs): TxHandle {
  const { adjustBalance } = useWalletStore.getState();
  return submitTransaction(
    "TRANSFER",
    {
      amount: args.amount,
      counterparty: args.destination,
      memo: args.memo,
      paymentPresentation: args.paymentPresentation ?? "usd_notional",
    },
    (record, ctx) => {
      if (record.status !== "confirmed" || ctx.ledgerExecution) return;
      const pres = args.paymentPresentation ?? "usd_notional";
      if (pres === "native_xlm") {
        adjustBalance("XLM", -args.amount);
      } else {
        adjustBalance("USDC", -args.amount);
      }
    },
  );
}

export function submitDeposit(args: DepositArgs): TxHandle {
  const { adjustBalance } = useWalletStore.getState();
  return submitTransaction(
    "DEPOSIT",
    { amount: args.amount, memo: args.memo },
    (record, ctx) => {
      if (record.status !== "confirmed" || ctx.ledgerExecution) return;
      adjustBalance("USDC", args.amount);
    },
  );
}

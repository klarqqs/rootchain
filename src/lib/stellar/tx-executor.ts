/**
 * Phase 3 — Real Stellar transaction executor.
 *
 * When the user has Freighter connected, this module replaces the Phase 2
 * simulator: it builds a real XDR, routes it through Freighter for signing,
 * and submits to Horizon testnet. The TxRecord lifecycle (building → signing
 * → broadcasting → confirmed) is unchanged so all existing UI animations work.
 *
 */

import { Transaction } from "@stellar/stellar-sdk";
import { networkPassphraseConst } from "./client";
import { horizon } from "./client";
import { buildPaymentTx, type SupportedAssetSymbol } from "./tx-builder";
import { signWithConnectedWallet } from "./wallet-signer";
import { useWalletStore } from "@/store/wallet.store";
import type { TxKind, TxPaymentPresentation, TxRecord } from "@/types/transaction";
import { XLM_USD_PRICE_ESTIMATE } from "./account";
import { activeIsPublicNetwork } from "./effective-network";

const env = import.meta.env;

const DEFAULT_ESCROW_TESTNET =
  "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGZEF5Q6EWRH5KHMU4HYL";

function readEscrow(pk: string | undefined): string {
  if (typeof pk === "string") {
    const t = pk.trim();
    if (t.length > 0) return t;
  }
  return "";
}

/** Escrow treasury per active ledger — must be configured independently for pilots. */
export function platformEscrowAddress(): string {
  if (activeIsPublicNetwork()) {
    const primary = readEscrow(env.VITE_PLATFORM_ESCROW_MAINNET as string | undefined);
    const fallback = readEscrow(env.VITE_PLATFORM_ESCROW as string | undefined);
    return primary || fallback;
  }
  const test = readEscrow(env.VITE_PLATFORM_ESCROW as string | undefined);
  return test || DEFAULT_ESCROW_TESTNET;
}

/** @deprecated Prefer `platformEscrowAddress()` for Phase 6 routing-aware routing. */
export const PLATFORM_ESCROW = env.VITE_PLATFORM_ESCROW ?? DEFAULT_ESCROW_TESTNET;

/** 1 USDC = N XLM on testnet (fixed rate; Phase 4 will use an oracle). */
export const USDC_XLM_RATE = Number(env.VITE_USDC_XLM_RATE ?? 8.47);

/** Minimum base reserve an account must keep (1.5 XLM base + 0.5 per entry). */
export const STELLAR_MIN_BALANCE = Number(env.VITE_STELLAR_MIN_BALANCE ?? 1.5);

export interface RealTxInput {
  kind: TxKind;
  sourcePublicKey: string;
  /** Pass "escrow" to route to the platform escrow. Otherwise a raw G-key. */
  destinationPublicKey: string | "escrow";
  asset: SupportedAssetSymbol;
  /** String-formatted amount (Stellar amounts are arbitrary-precision). */
  amount: string;
  memo?: string;
  paymentPresentation?: TxPaymentPresentation;
  /** UI USD notional for invest/deposit flows (on-chain settlement is always XLM in this pilot path). */
  usdIntentUsd?: number;
}

export type RealTxListener = (update: TxRecord) => void;

// ─── Horizon error extraction ────────────────────────────────────────────────

function extractHorizonMessage(e: unknown): string {
  if (!(e instanceof Error)) return String(e);
  // Horizon errors expose extras.result_codes
  const obj = e as unknown as Record<string, unknown>;
  const extras = obj["extras"] as Record<string, unknown> | undefined;
  const codes = extras?.["result_codes"] as Record<string, unknown> | undefined;
  if (codes) {
    const ops = codes["operations"] as string[] | undefined;
    const tx = codes["transaction"] as string | undefined;
    const parts = [tx, ...(ops ?? [])].filter(Boolean);
    if (parts.length) return parts.join(", ");
  }
  return e.message || "Transaction failed";
}

// ─── Main executor ───────────────────────────────────────────────────────────

/**
 * Execute a real Stellar transaction via Freighter.
 * Fires `onUpdate` at every lifecycle step (building → signing → broadcasting
 * → confirmed / failed) so the existing UI transitions animate correctly.
 *
 * Returns the final Stellar tx hash.
 */
export async function executeRealTx(
  input: RealTxInput,
  onUpdate: RealTxListener,
): Promise<string> {
  const escrowPk = platformEscrowAddress();

  if (input.destinationPublicKey === "escrow") {
    if (activeIsPublicNetwork() && !escrowPk.trim()) {
      const msg =
        "Mainnet escrow treasury is not configured. Set VITE_PLATFORM_ESCROW_MAINNET before broadcasting payments.";
      onUpdate({
        hash: "failed",
        kind: input.kind,
        status: "failed",
        amount: input.usdIntentUsd ?? 0,
        paymentPresentation: input.paymentPresentation ?? "usd_notional",
        fee: 0.00001,
        confirmations: 0,
        memo: msg,
        createdAt: Date.now(),
        settledAt: Date.now(),
      });
      return "failed";
    }
    if (!escrowPk.trim()) {
      const msg =
        "Platform escrow address is blank. Populate VITE_PLATFORM_ESCROW before signing.";
      onUpdate({
        hash: "failed",
        kind: input.kind,
        status: "failed",
        amount: input.usdIntentUsd ?? 0,
        paymentPresentation: input.paymentPresentation ?? "usd_notional",
        fee: 0.00001,
        confirmations: 0,
        memo: msg,
        createdAt: Date.now(),
        settledAt: Date.now(),
      });
      return "failed";
    }
  }

  const destination =
    input.destinationPublicKey === "escrow" ? escrowPk! : input.destinationPublicKey;

  // ── 1. Build XDR (gives us the real hash before signing) ─────────────────
  const presentation: TxPaymentPresentation = input.paymentPresentation ?? "usd_notional";
  const xlmPaid = Number.parseFloat(input.amount);
  const safeXlm = Number.isFinite(xlmPaid) ? xlmPaid : 0;
  const displayAmount =
    presentation === "native_xlm" ? safeXlm : input.usdIntentUsd ?? 0;

  const baseRecord = (status: TxRecord["status"], extra?: Partial<TxRecord>): TxRecord => ({
    hash: "pending",
    kind: input.kind,
    status,
    amount: displayAmount,
    paymentPresentation: presentation,
    chainAmountXlm: safeXlm,
    usdNotional:
      presentation === "native_xlm"
        ? safeXlm * XLM_USD_PRICE_ESTIMATE
        : displayAmount,
    fee: 0.00001,
    confirmations: 0,
    memo: input.memo,
    createdAt: Date.now(),
    settledAt: null,
    ...extra,
  });

  onUpdate(baseRecord("building"));

  let unsignedXdr: string;
  let realHash: string;

  try {
    unsignedXdr = await buildPaymentTx({
      source: input.sourcePublicKey,
      destination,
      asset: input.asset,
      amount: input.amount,
      memo: input.memo,
    });

    // Derive the deterministic transaction hash from the unsigned envelope.
    const tx = new Transaction(unsignedXdr, networkPassphraseConst());
    realHash = tx.hash().toString("hex");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not build transaction";
    onUpdate(baseRecord("failed", { hash: "failed", settledAt: Date.now(), memo: msg }));
    return "failed";
  }

  const base = (status: TxRecord["status"], extra?: Partial<TxRecord>): TxRecord => ({
    ...baseRecord(status, extra),
    hash: realHash,
  });

  // ── 2. Signing ─────────────────────────────────────────────────────────────
  onUpdate(base("signing"));

  const signResult = await signWithConnectedWallet(
    useWalletStore.getState().account!.provider,
    unsignedXdr,
    input.sourcePublicKey,
  );
  if (!signResult.ok) {
    onUpdate(
      base("failed", {
        settledAt: Date.now(),
        memo: signResult.error.message ?? "Signature rejected",
      }),
    );
    return realHash;
  }

  // ── 3. Broadcasting ────────────────────────────────────────────────────────
  onUpdate(base("broadcasting"));

  try {
    const signedTx = new Transaction(signResult.value, networkPassphraseConst());
    const response = await horizon().submitTransaction(signedTx);

    const feeSource = response as unknown as { fee_charged?: string };
    const feePaid = feeSource.fee_charged ? Number(feeSource.fee_charged) / 1e7 : Number.NaN;

    // Stellar is final on first ledger — map to 5/5 confirmations.
    onUpdate({
      ...base("confirmed"),
      hash: response.hash,
      confirmations: 5,
      ledger: response.ledger,
      fee: Number.isFinite(feePaid) ? feePaid : 0.00001,
      settledAt: Date.now(),
    });

    return response.hash;
  } catch (e) {
    const msg = extractHorizonMessage(e);
    onUpdate(base("failed", { settledAt: Date.now(), memo: msg }));
    return realHash;
  }
}

/**
 * Stellar transaction builder helpers.
 *
 * Phase 2 — these functions construct *real* Stellar transactions but DO NOT
 * broadcast them. Marketplace investments still settle through the simulator.
 * Phase 3 will plug `signWithFreighter` + `horizon().submitTransaction()` into
 * the call sites here.
 */

import {
  Asset,
  BASE_FEE,
  Memo,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { horizon, networkPassphraseConst } from "./client";
import { ledgerAssetsSnapshot, type SupportedAssetSymbol } from "./account";

export type { SupportedAssetSymbol };

function assetFor(symbol: SupportedAssetSymbol): Asset {
  const MAP = ledgerAssetsSnapshot();
  const a = MAP[symbol];
  if (a.native || !a.issuer) return Asset.native();
  return new Asset(a.code, a.issuer);
}

interface PaymentArgs {
  source: string;
  destination: string;
  asset: SupportedAssetSymbol;
  amount: string;
  memo?: string;
}

/**
 * Build (but don't sign or submit) a payment transaction.
 * Returns the XDR string, which can be passed to Freighter for signing.
 */
export async function buildPaymentTx(args: PaymentArgs): Promise<string> {
  const account = await horizon().loadAccount(args.source);

  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: networkPassphraseConst(),
  }).addOperation(
    Operation.payment({
      destination: args.destination,
      asset: assetFor(args.asset),
      amount: args.amount,
    }),
  );

  if (args.memo) builder.addMemo(Memo.text(args.memo.slice(0, 28)));

  const tx = builder.setTimeout(180).build();

  return tx.toXDR();
}

/**
 * Build a trustline-establishment transaction. Stellar requires this before
 * an account can hold a non-native asset (USDC, RC-SHARES).
 */
export async function buildChangeTrustTx(
  source: string,
  symbol: Exclude<SupportedAssetSymbol, "XLM">,
  limit?: string,
): Promise<string> {
  const account = await horizon().loadAccount(source);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: networkPassphraseConst(),
  })
    .addOperation(
      Operation.changeTrust({
        asset: assetFor(symbol),
        limit,
      }),
    )
    .setTimeout(180)
    .build();
  return tx.toXDR();
}

/**
 * Trustline management for Stellar custom assets.
 *
 * On Stellar, an account must explicitly opt in to hold a non-native asset
 * by establishing a "trustline" via a ChangeTrust operation.
 * This module handles detecting and setting up USDC + RC-SHARES trustlines.
 */

import { horizon } from "./client";
import { buildChangeTrustTx } from "./tx-builder";
import { signWithFreighter } from "./freighter";
import { networkPassphraseConst } from "./client";
import { getActiveRcCode, getActiveRcIssuer, getActiveUsdcCode, getActiveUsdcIssuer } from "./effective-network";
import { Transaction } from "@stellar/stellar-sdk";

export interface TrustlineStatus {
  usdc: boolean;
  rcShare: boolean;
}

/** Inspect an account's balances to check which trustlines are established. */
export async function checkTrustlines(publicKey: string): Promise<TrustlineStatus> {
  try {
    const account = await horizon().loadAccount(publicKey);
    const balances = account.balances as Array<{
      asset_type: string;
      asset_code?: string;
      asset_issuer?: string;
    }>;

    const usdc = balances.some(
      (b) =>
        b.asset_type !== "native" &&
        b.asset_code === getActiveUsdcCode() &&
        b.asset_issuer === getActiveUsdcIssuer(),
    );
    const rcShare = balances.some(
      (b) =>
        b.asset_type !== "native" &&
        b.asset_code === getActiveRcCode() &&
        b.asset_issuer === getActiveRcIssuer(),
    );

    return { usdc, rcShare };
  } catch {
    return { usdc: false, rcShare: false };
  }
}

/** Establish a USDC trustline via Freighter signing. */
export async function addUsdcTrustline(
  publicKey: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const xdr = await buildChangeTrustTx(publicKey, "USDC");
    const sig = await signWithFreighter(xdr, publicKey);
    if (!sig.ok) return { ok: false, error: sig.error.message };
    const tx = new Transaction(sig.value, networkPassphraseConst());
    await horizon().submitTransaction(tx);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

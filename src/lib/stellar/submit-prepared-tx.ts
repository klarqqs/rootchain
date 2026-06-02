/**
 * Sign and submit a pre-built unsigned Stellar transaction envelope (USDC invest flow).
 */

import { Transaction } from "@stellar/stellar-sdk";
import { horizon, networkPassphraseConst } from "@/lib/stellar/client";
import { signWithConnectedWallet } from "@/lib/stellar/wallet-signer";
import { useWalletStore } from "@/store/wallet.store";

function extractHorizonMessage(e: unknown): string {
  if (!(e instanceof Error)) return String(e);
  const obj = e as unknown as Record<string, unknown>;
  const extras = obj.extras as Record<string, unknown> | undefined;
  const codes = extras?.result_codes as Record<string, unknown> | undefined;
  if (codes) {
    const ops = codes.operations as string[] | undefined;
    const tx = codes.transaction as string | undefined;
    return [tx, ...(ops ?? [])].filter(Boolean).join(", ") || e.message;
  }
  return e.message;
}

export async function submitPreparedTransaction(
  unsignedXdr: string,
  sourcePublicKey: string,
): Promise<{ ok: true; hash: string } | { ok: false; error: string }> {
  const account = useWalletStore.getState().account;
  if (!account) {
    return { ok: false, error: "Connect Freighter or LOBSTR to sign the investment." };
  }

  try {
    const signResult = await signWithConnectedWallet(
      account.provider,
      unsignedXdr,
      sourcePublicKey,
    );
    if (!signResult.ok) {
      return { ok: false, error: signResult.error.message ?? "Signature rejected" };
    }

    const signedTx = new Transaction(signResult.value, networkPassphraseConst());
    const response = await horizon().submitTransaction(signedTx);
    return { ok: true, hash: response.hash };
  } catch (e) {
    return { ok: false, error: extractHorizonMessage(e) };
  }
}

/**
 * Build an unsigned USDC payment XDR for a marketplace investment.
 * Does not sign or submit — placeholder for future Stellar settlement.
 */

import { buildPaymentTx } from "@/lib/stellar/tx-builder";
import { platformEscrowAddress } from "@/lib/stellar/tx-executor";

/** Stellar USDC amounts use up to 7 decimal places. */
export function formatUsdcAmount(amount: number): string {
  return amount.toFixed(7).replace(/\.?0+$/, "") || "0.0000001";
}

export async function prepareUsdcInvestmentPayment(params: {
  sourcePublicKey: string;
  amountUsdc: number;
  projectId: string;
}): Promise<{ ok: true; preparedXdr: string } | { ok: false; error: string }> {
  try {
    const preparedXdr = await buildPaymentTx({
      source: params.sourcePublicKey,
      destination: platformEscrowAddress(),
      asset: "USDC",
      amount: formatUsdcAmount(params.amountUsdc),
      memo: `RC:${params.projectId.slice(0, 8)}`,
    });
    return { ok: true, preparedXdr };
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : "Could not prepare USDC payment. Ensure the wallet account is funded on the active network.";
    return { ok: false, error: message };
  }
}

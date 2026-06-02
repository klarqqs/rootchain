import { Horizon } from "@stellar/stellar-sdk";
import { getHorizonUrl, getPlatformEscrow, getUsdcIssuer, USDC_ASSET_CODE } from "./config.js";

export interface PaymentVerificationInput {
  stellarTxHash: string;
  expectedSource: string;
  expectedDestination?: string;
  expectedAmount: number;
  projectId: string;
  tolerance?: number;
}

export interface PaymentVerificationResult {
  valid: boolean;
  reason?: string;
  amount?: number;
  source?: string;
  destination?: string;
}

function horizonServer(): Horizon.Server {
  return new Horizon.Server(getHorizonUrl());
}

export async function verifyUsdcInvestmentPayment(
  input: PaymentVerificationInput,
): Promise<PaymentVerificationResult> {
  const escrow = (input.expectedDestination ?? getPlatformEscrow()).trim();
  if (!escrow) {
    return { valid: false, reason: "Platform escrow not configured" };
  }

  const issuer = getUsdcIssuer();
  const tolerance = input.tolerance ?? 0.0001;

  try {
    const tx = await horizonServer().transactions().transaction(input.stellarTxHash).call();
    if (!tx.successful) {
      return { valid: false, reason: "Transaction failed on ledger" };
    }

    const ops = await horizonServer().operations().forTransaction(input.stellarTxHash).call();
    const payment = ops.records.find(
      (op) =>
        op.type === "payment" &&
        "asset_type" in op &&
        op.asset_type === "credit_alphanum4" &&
        "asset_code" in op &&
        op.asset_code === USDC_ASSET_CODE &&
        "asset_issuer" in op &&
        op.asset_issuer === issuer,
    ) as Horizon.HorizonApi.PaymentOperationResponse | undefined;

    if (!payment) {
      return { valid: false, reason: "No USDC payment operation found" };
    }

    const amount = Number(payment.amount);
    const source = payment.from;
    const destination = payment.to;

    if (source !== input.expectedSource) {
      return { valid: false, reason: "Payment source does not match investor wallet" };
    }
    if (destination !== escrow) {
      return { valid: false, reason: "Payment destination is not platform escrow" };
    }
    if (Math.abs(amount - input.expectedAmount) > tolerance) {
      return {
        valid: false,
        reason: `Payment amount mismatch (expected ${input.expectedAmount}, got ${amount})`,
      };
    }

    if (tx.memo_type === "text" && tx.memo) {
      const memo = String(tx.memo);
      if (!memo.includes(input.projectId.slice(0, 8))) {
        return { valid: false, reason: "Transaction memo does not reference project" };
      }
    }

    return { valid: true, amount, source, destination };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Horizon verification failed";
    return { valid: false, reason: message };
  }
}

export function buildInvestmentMemo(projectId: string): string {
  return `RC:${projectId.slice(0, 8)}`;
}

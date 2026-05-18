import { StrKey } from "@stellar/stellar-sdk";
import type { TxKind } from "@/types/transaction";
import type { DispatchInput } from "@/services/tx-dispatch";

export class TxValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TxValidationError";
  }
}

const MAX_USD_NOTIONAL = 500_000_000;
const MIN_USD_NOTIONAL = 0.000_0001;
const MAX_NATIVE_XLM = 500_000;
const MIN_NATIVE_XLM = 0.000_0001;
const MEMO_MAX = 64;

/** Guardrails applied before routing to Horizon or the simulator. */
export function validateDispatchInput(kind: TxKind, input: DispatchInput): void {
  const pres = input.paymentPresentation ?? "usd_notional";

  if (!Number.isFinite(input.amount)) {
    throw new TxValidationError("Amount must be a finite number.");
  }

  if (pres === "native_xlm") {
    if (input.amount < MIN_NATIVE_XLM || input.amount > MAX_NATIVE_XLM) {
      throw new TxValidationError(
        `Native XLM amount must be between ${MIN_NATIVE_XLM} and ${MAX_NATIVE_XLM} XLM.`,
      );
    }
  } else {
    if (input.amount < MIN_USD_NOTIONAL || input.amount > MAX_USD_NOTIONAL) {
      throw new TxValidationError(
        `Amount must be between ${MIN_USD_NOTIONAL} and ${MAX_USD_NOTIONAL} (USD-notional).`,
      );
    }
  }

  if (input.memo !== undefined && input.memo.length > MEMO_MAX) {
    throw new TxValidationError(`Memo too long (max ${MEMO_MAX} chars).`);
  }

  if (input.produceId !== undefined && input.produceId.length > 48) {
    throw new TxValidationError("Listing reference is too long.");
  }

  if (kind === "TRANSFER") {
    if (!input.counterparty) {
      throw new TxValidationError("Destination wallet is required for transfers.");
    }
    if (!StrKey.isValidEd25519PublicKey(input.counterparty)) {
      throw new TxValidationError("Destination must be a valid Stellar public key.");
    }
  }
}

export type TxKind =
  | "INVEST"
  | "CLAIM"
  | "TRANSFER"
  | "DEPOSIT"
  | "WITHDRAW"
  | "SELL"
  | "REWARD";

export type TxStatus =
  | "building"
  | "signing"
  | "broadcasting"
  | "pending"
  | "confirmed"
  | "failed";

export interface TxAsset {
  symbol: string;
  amount: number;
}

/**
 * Internal transaction record. Mock now, real later.
 * The shape mirrors what we'll get back from Horizon
 * so we can swap the implementation without touching the UI.
 */
export type TxPaymentPresentation = "usd_notional" | "native_xlm";

export interface TxRecord {
  /** Stellar-style 64-char lowercase hex hash. */
  hash: string;
  kind: TxKind;
  status: TxStatus;
  /**
   * Primary amount for UI: USDC notional for invest/deposit-style flows, or native XLM
   * when `paymentPresentation` is `native_xlm` (e.g. peer XLM send).
   */
  amount: number;
  /** How to interpret `amount` in list views and receipts. */
  paymentPresentation?: TxPaymentPresentation;
  /** Approximate USD notional when the on-chain leg is XLM. */
  usdNotional?: number;
  /** Parsed XLM paid on-chain for USDC-notional flows (invest/escrow). */
  chainAmountXlm?: number;
  /** Optional second leg (e.g. RC-SHARES received from an INVEST). */
  receivedAsset?: TxAsset;
  /** Reference to a produce listing if applicable. */
  produceId?: string;
  produceName?: string;
  /** Free-text memo shown in the explorer view. */
  memo?: string;
  /** Counterparty / destination address (Stellar G-key). */
  counterparty?: string;
  /** Network fee in XLM. */
  fee: number;
  /** Block ledger number when confirmed. */
  ledger?: number;
  /** Number of confirmations seen by the simulator (max 6). */
  confirmations: number;
  /** Unix ms. */
  createdAt: number;
  /** Unix ms — set when status reaches "confirmed" or "failed". */
  settledAt: number | null;
}

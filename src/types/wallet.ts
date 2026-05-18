export type WalletProviderId =
  | "freighter"
  | "albedo"
  | "xbull"
  | "walletconnect"
  | "ledger";

export type WalletStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export type StellarNetwork = "TESTNET" | "PUBLIC" | "FUTURENET";

export interface WalletBalance {
  asset: string;
  symbol: string;
  amount: number;
  usdValue: number;
  chg24h: number;
  issuer?: string;
  icon?: string;
  color: string;
}

export interface WalletAccount {
  /** Stellar G-public-key (testnet only in Phase 2). */
  publicKey: string;
  /** Provider that produced the connection. */
  provider: WalletProviderId;
  /** Network reported by the provider — must be TESTNET in Phase 2. */
  network: StellarNetwork;
  /** Account sequence number from Horizon (string to preserve precision). */
  sequence?: string;
  /** Friendly label for display. */
  label?: string;
}

export interface WalletState {
  status: WalletStatus;
  account: WalletAccount | null;
  balances: WalletBalance[];
  totalUsd: number;
  /** True if the connection was restored from local storage. */
  isHydrated: boolean;
  /** Last error from a wallet operation, surfaced to the UI. */
  lastError: string | null;
  /** Epoch ms when the current wallet session opened (audit / UX cues only). */
  sessionStartedAt: number | null;
}

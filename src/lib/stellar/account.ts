import type { WalletBalance } from "@/types/wallet";
import { tokens } from "@/lib/tokens";
import { horizon } from "./client";
import {
  getActiveRcCode,
  getActiveRcIssuer,
  getActiveUsdcCode,
  getActiveUsdcIssuer,
} from "./effective-network";

/**
 * Live USD/asset price tape — Phase 2 keeps these as constants.
 * Phase 3 will swap for an oracle / coingecko feed.
 */
const PRICE_USD: Record<string, { usd: number; chg24h: number }> = {
  USDC: { usd: 1.0, chg24h: 0.01 },
  XLM: { usd: 0.118, chg24h: 1.9 },
  RCSHARE: { usd: 59.13, chg24h: 4.2 },
};

/** Fallback XLM USD mark used for escrow notional badges (replace with oracle when ready). */
export const XLM_USD_PRICE_ESTIMATE = PRICE_USD.XLM.usd;

const ASSET_META: Record<string, { name: string; color: string; icon: string }> = {
  USDC: { name: "USD Coin", color: "#2775CA", icon: "$" },
  XLM: { name: "Stellar Lumens", color: "#7D00FF", icon: "✦" },
  RCSHARE: { name: "Harvest Shares", color: "#84CC16", icon: "♢" },
};

interface RawBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
}

function normalizeBalance(b: RawBalance): WalletBalance | null {
  let symbol: string;
  if (b.asset_type === "native") {
    symbol = "XLM";
  } else if (b.asset_code) {
    symbol = b.asset_code;
  } else {
    return null;
  }

  const meta = ASSET_META[symbol] ?? {
    name: symbol,
    color: tokens.inkMuted,
    icon: symbol.charAt(0),
  };
  const price = PRICE_USD[symbol] ?? { usd: 0, chg24h: 0 };
  const amount = Number.parseFloat(b.balance);

  return {
    asset: symbol,
    symbol,
    amount,
    usdValue: amount * price.usd,
    chg24h: price.chg24h,
    color: meta.color,
    icon: meta.icon,
    issuer: b.asset_issuer,
  };
}

/**
 * Fetch on-chain balances for a Stellar account.
 * Used in Phase 2 when wallet is real (Freighter), throws if account unfunded.
 */
export async function fetchAccountBalances(publicKey: string): Promise<WalletBalance[]> {
  const account = await horizon().loadAccount(publicKey);
  const balances = (account.balances as RawBalance[])
    .map(normalizeBalance)
    .filter((b): b is WalletBalance => b !== null)
    /* Sort: USDC > XLM > others */
    .sort((a, b) => {
      const order = (s: string) => (s === "USDC" ? 0 : s === "XLM" ? 1 : 2);
      return order(a.symbol) - order(b.symbol);
    });
  return balances;
}

/**
 * Pre-built reference assets used when constructing real Stellar transactions.
 */
export function ledgerAssetsSnapshot() {
  return {
    XLM: { code: "XLM", issuer: undefined as string | undefined, native: true as const },
    USDC: {
      code: getActiveUsdcCode(),
      issuer: getActiveUsdcIssuer(),
      native: false as const,
    },
    RCSHARE: {
      code: getActiveRcCode(),
      issuer: getActiveRcIssuer(),
      native: false as const,
    },
  };
}

export type LedgerAssets = ReturnType<typeof ledgerAssetsSnapshot>;
export type SupportedAssetSymbol = keyof LedgerAssets;

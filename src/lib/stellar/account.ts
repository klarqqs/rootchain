import type { WalletBalance } from "@/types/wallet";
import { horizon } from "./client";
import { getActiveUsdcCode, getActiveUsdcIssuer } from "./effective-network";

/** Static USD marks for portfolio display — replace with oracle when ready. */
const PRICE_USD: Record<string, { usd: number; chg24h: number }> = {
  USDC: { usd: 1.0, chg24h: 0 },
  XLM: { usd: 0.118, chg24h: 0 },
};

export const XLM_USD_PRICE_ESTIMATE = PRICE_USD.XLM.usd;

const ASSET_META: Record<string, { name: string; color: string; icon: string }> = {
  USDC: { name: "USD Coin", color: "#2775CA", icon: "$" },
  XLM: { name: "Stellar Lumens", color: "#7D00FF", icon: "✦" },
};

interface RawBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
}

function buildBalanceRow(symbol: "XLM" | "USDC", amount: number, issuer?: string): WalletBalance {
  const meta = ASSET_META[symbol];
  const price = PRICE_USD[symbol];
  return {
    asset: symbol,
    symbol,
    amount,
    usdValue: amount * price.usd,
    chg24h: price.chg24h,
    color: meta.color,
    icon: meta.icon,
    issuer,
  };
}

function isNotFoundError(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const status = (e as { response?: { status?: number }; status?: number }).response?.status
    ?? (e as { status?: number }).status;
  return status === 404;
}

/**
 * Fetch live XLM + USDC balances from Horizon.
 * Unfunded or empty accounts return 0 for both assets — never fabricated values.
 */
export async function fetchAccountBalances(publicKey: string): Promise<WalletBalance[]> {
  const usdcCode = getActiveUsdcCode();
  const usdcIssuer = getActiveUsdcIssuer();

  let xlmAmount = 0;
  let usdcAmount = 0;

  try {
    const account = await horizon().loadAccount(publicKey);
    for (const raw of account.balances as RawBalance[]) {
      if (raw.asset_type === "native") {
        xlmAmount = Number.parseFloat(raw.balance) || 0;
      } else if (raw.asset_code === usdcCode && raw.asset_issuer === usdcIssuer) {
        usdcAmount = Number.parseFloat(raw.balance) || 0;
      }
    }
  } catch (e) {
    if (!isNotFoundError(e)) {
      throw e instanceof Error ? e : new Error("Could not load account from Horizon.");
    }
    // Account not funded on ledger — both balances stay 0.
  }

  return [
    buildBalanceRow("XLM", xlmAmount),
    buildBalanceRow("USDC", usdcAmount, usdcIssuer || undefined),
  ];
}

/** Reference assets for transaction construction. */
export function ledgerAssetsSnapshot() {
  return {
    XLM: { code: "XLM", issuer: undefined as string | undefined, native: true as const },
    USDC: {
      code: getActiveUsdcCode(),
      issuer: getActiveUsdcIssuer(),
      native: false as const,
    },
  };
}

export type LedgerAssets = ReturnType<typeof ledgerAssetsSnapshot>;
export type SupportedAssetSymbol = keyof LedgerAssets;

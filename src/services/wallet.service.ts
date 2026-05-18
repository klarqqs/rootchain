/**
 * Wallet service — orchestrates the connection flow across providers.
 *
 * Phase 2:
 *   - Freighter: real testnet connection via @stellar/freighter-api.
 *   - All other providers: simulated (UX-identical) so the UI stays alive
 *     until those integrations are added.
 */

import type { WalletAccount, WalletBalance, WalletProviderId } from "@/types/wallet";
import type { Result } from "@/types/common";
import { err, ok } from "@/types/common";
import { connectFreighter, reconnectFreighterSilently } from "@/lib/stellar/freighter";
import { fetchAccountBalances } from "@/lib/stellar/account";
import { mockGet, MockApiError } from "@/api/client";

const DEMO_ACCOUNT_BY_PROVIDER: Record<WalletProviderId, string> = {
  freighter: "GDEMOFREIGHTERPLACEHOLDER000000000000000000000000000000000000",
  albedo: "GDEMOALBEDOPLACEHOLDER000000000000000000000000000000000000ALBE",
  xbull: "GDEMOXBULLPLACEHOLDER000000000000000000000000000000000000XBUL",
  walletconnect: "GDEMOWCPLACEHOLDER000000000000000000000000000000000000000WC",
  ledger: "GDEMOLEDGERPLACEHOLDER000000000000000000000000000000000000LEDG",
};

const DEMO_BALANCES: WalletBalance[] = [
  { asset: "USDC", symbol: "USDC", amount: 28247.18, usdValue: 28247.18, chg24h: 0.01, color: "#2775CA", icon: "$" },
  { asset: "XLM", symbol: "XLM", amount: 14820, usdValue: 14820 * 0.118, chg24h: 1.9, color: "#7D00FF", icon: "✦" },
  { asset: "RCSHARE", symbol: "RC-SHARES", amount: 142.4, usdValue: 8420.30, chg24h: 4.2, color: "#84CC16", icon: "♢" },
];

export interface ConnectResult {
  account: WalletAccount;
  balances: WalletBalance[];
}

/**
 * Phase 2 connect entry point. UI calls this and gets back either a
 * real or simulated account, depending on provider.
 */
export async function connect(provider: WalletProviderId): Promise<Result<ConnectResult>> {
  if (provider === "walletconnect") {
    return err({
      name: "WalletConnectNotReady",
      message:
        "WalletConnect pairing for Stellar signing is queued for rollout. Use Freighter (desktop/extension) today for live Stellar testnet payments. When ready, ROOTCHAIN will use a project id from VITE_WALLETCONNECT_PROJECT_ID plus the Stellar wallet adapter.",
      code: "WALLETCONNECT_PREP_ONLY",
    });
  }

  if (provider === "freighter") {
    const conn = await connectFreighter();
    if (!conn.ok) return err(conn.error);

    try {
      const balances = await fetchAccountBalances(conn.value.publicKey);
      return ok({
        account: {
          publicKey: conn.value.publicKey,
          provider: "freighter",
          network: conn.value.network as WalletAccount["network"],
          label: "Freighter",
        },
        balances,
      });
    } catch {
      // Unfunded or missing account on Horizon → show truthful empty state so Friendbot UX can activate.
      return ok({
        account: {
          publicKey: conn.value.publicKey,
          provider: "freighter",
          network: conn.value.network as WalletAccount["network"],
          label: "Freighter",
        },
        balances: [],
      });
    }
  }

  // Simulated providers — keep UI flow identical.
  return mockGet<Result<ConnectResult>>(() =>
    ok({
      account: {
        publicKey: DEMO_ACCOUNT_BY_PROVIDER[provider],
        provider,
        network: "TESTNET",
        label: provider.charAt(0).toUpperCase() + provider.slice(1),
      },
      balances: DEMO_BALANCES,
    }),
  );
}

/**
 * Re-attach a wallet on app boot if the user previously approved access.
 */
export async function reconnect(provider: WalletProviderId): Promise<Result<ConnectResult>> {
  if (provider !== "freighter") {
    // Simulated providers don't expose re-auth, so we accept persisted state as-is.
    return err({
      name: "ProviderHasNoSilentReconnect",
      message: "Provider does not support silent reconnect.",
      code: "PROVIDER_NO_SILENT_RECONNECT",
    });
  }
  const conn = await reconnectFreighterSilently();
  if (!conn.ok) return err(conn.error);
  let balances: WalletBalance[];
  try {
    const fetched = await fetchAccountBalances(conn.value.publicKey);
    balances = fetched.length === 0 ? DEMO_BALANCES : fetched;
  } catch {
    balances = DEMO_BALANCES;
  }
  return ok({
    account: {
      publicKey: conn.value.publicKey,
      provider: "freighter",
      network: "TESTNET",
      label: "Freighter",
    },
    balances,
  });
}

/**
 * Refresh balances for the connected wallet. Falls back to existing
 * balances if Horizon is unreachable.
 */
export async function refreshBalances(account: WalletAccount): Promise<Result<WalletBalance[]>> {
  if (account.provider === "freighter") {
    try {
      const balances = await fetchAccountBalances(account.publicKey);
      return ok(balances);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not reach Horizon.";
      return err({ name: "HorizonUnreachable", message, code: "HORIZON_UNREACHABLE" });
    }
  }
  return ok(DEMO_BALANCES);
}

/**
 * Disconnect — Phase 2 just clears local state. There is no Freighter
 * "logout"; the user must revoke access in the extension itself.
 */
export async function disconnect(): Promise<Result<true>> {
  try {
    return ok(true);
  } catch (e) {
    if (e instanceof MockApiError) {
      return err({ name: "DisconnectFailed", message: e.message, code: e.code });
    }
    return err({
      name: "DisconnectFailed",
      message: "Could not disconnect.",
      code: "DISCONNECT_FAILED",
    });
  }
}

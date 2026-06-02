/**
 * Wallet service — real Stellar wallet connections only (Freighter + LOBSTR).
 */

import type { WalletAccount, WalletBalance, WalletProviderId } from "@/types/wallet";
import type { Result } from "@/types/common";
import { err, ok } from "@/types/common";
import { useWalletStore } from "@/store/wallet.store";
import { connectFreighter, reconnectFreighterSilently } from "@/lib/stellar/freighter";
import { connectLobstr, reconnectLobstrSilently } from "@/lib/stellar/lobstr";
import { fetchAccountBalances } from "@/lib/stellar/account";
import { isRealSigningProvider } from "@/lib/stellar/wallet-signer";

export interface ConnectResult {
  account: WalletAccount;
  balances: WalletBalance[];
}

async function balancesForKey(publicKey: string): Promise<WalletBalance[]> {
  try {
    return await fetchAccountBalances(publicKey);
  } catch {
    return [];
  }
}

async function connectProvider(
  provider: WalletProviderId,
): Promise<Result<{ publicKey: string; network: WalletAccount["network"]; label: string }>> {
  if (provider === "freighter") {
    const conn = await connectFreighter();
    if (!conn.ok) return err(conn.error);
    return ok({
      publicKey: conn.value.publicKey,
      network: conn.value.network as WalletAccount["network"],
      label: "Freighter",
    });
  }

  if (provider === "lobstr") {
    const conn = await connectLobstr();
    if (!conn.ok) return err(conn.error);
    return ok({
      publicKey: conn.value.publicKey,
      network: conn.value.network,
      label: "LOBSTR",
    });
  }

  return err({
    name: "UnsupportedWallet",
    message: "Only Freighter and LOBSTR wallets are supported.",
    code: "UNSUPPORTED_WALLET",
  });
}

export async function connect(provider: WalletProviderId): Promise<Result<ConnectResult>> {
  if (!isRealSigningProvider(provider)) {
    return err({
      name: "UnsupportedWallet",
      message: "Only Freighter and LOBSTR wallets are supported.",
      code: "UNSUPPORTED_WALLET",
    });
  }

  const conn = await connectProvider(provider);
  if (!conn.ok) return err(conn.error);

  const balances = await balancesForKey(conn.value.publicKey);

  return ok({
    account: {
      publicKey: conn.value.publicKey,
      provider,
      network: conn.value.network,
      label: conn.value.label,
    },
    balances,
  });
}

export async function reconnect(provider: WalletProviderId): Promise<Result<ConnectResult>> {
  if (!isRealSigningProvider(provider)) {
    return err({
      name: "ProviderHasNoSilentReconnect",
      message: "Provider does not support reconnect.",
      code: "PROVIDER_NO_SILENT_RECONNECT",
    });
  }

  const conn =
    provider === "freighter" ? await reconnectFreighterSilently() : await reconnectLobstrSilently();
  if (!conn.ok) return err(conn.error);

  const balances = await balancesForKey(conn.value.publicKey);

  return ok({
    account: {
      publicKey: conn.value.publicKey,
      provider,
      network: conn.value.network as WalletAccount["network"],
      label: provider === "freighter" ? "Freighter" : "LOBSTR",
    },
    balances,
  });
}

export async function refreshBalances(account: WalletAccount): Promise<Result<WalletBalance[]>> {
  if (!isRealSigningProvider(account.provider)) {
    return err({
      name: "UnsupportedWallet",
      message: "Only real Stellar wallets can refresh balances.",
      code: "UNSUPPORTED_WALLET",
    });
  }

  try {
    const balances = await fetchAccountBalances(account.publicKey);
    return ok(balances);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not reach Horizon.";
    return err({ name: "HorizonUnreachable", message, code: "HORIZON_UNREACHABLE" });
  }
}

export async function disconnectWallet(): Promise<Result<true>> {
  try {
    useWalletStore.getState().disconnectWallet();
    return ok(true);
  } catch {
    return err({
      name: "DisconnectFailed",
      message: "Could not disconnect.",
      code: "DISCONNECT_FAILED",
    });
  }
}

/** @deprecated Prefer `disconnectWallet`. */
export async function disconnect(): Promise<Result<true>> {
  return disconnectWallet();
}

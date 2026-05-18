/**
 * Friendbot — Stellar testnet account funding utility.
 *
 * The Stellar testnet Friendbot funds a new account with 10,000 XLM.
 * This is only available on testnet and is invaluable for development.
 * NEVER call this on mainnet — it returns a 404 on public network.
 */

import { FRIENDBOT_URL } from "./config";
import { activeIsTestnet } from "./effective-network";

export interface FriendbotResult {
  funded: boolean;
  hash?: string;
  error?: string;
}

/**
 * Fund a testnet account via Friendbot.
 * Returns the funding transaction hash on success.
 */
export async function fundWithFriendbot(publicKey: string): Promise<FriendbotResult> {
  if (!activeIsTestnet()) {
    return {
      funded: false,
      error: "Friendbot is only available on Stellar testnet.",
    };
  }

  try {
    const url = `${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`;
    const res = await fetch(url);

    if (!res.ok) {
      const body = await res.text().catch(() => "Unknown error");
      // Friendbot returns 400 if the account is already funded.
      if (res.status === 400 && body.includes("already exists")) {
        return { funded: false, error: "Account already funded on testnet." };
      }
      return { funded: false, error: `Friendbot error ${res.status}: ${body.slice(0, 120)}` };
    }

    const data = await res.json();
    return { funded: true, hash: data.hash as string };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { funded: false, error: `Network error: ${msg}` };
  }
}

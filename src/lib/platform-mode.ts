/**
 * Production vs pilot behavior for wallet settlement and marketing gates.
 */

import { MAINNET_ROUTING_ENABLED } from "@/lib/stellar/effective-network";
import { isSupabaseConfigured } from "@/lib/supabase-env";

const env = import.meta.env;

/** When true, invest/send/deposit must broadcast via Freighter (no simulated balances). */
export function requiresRealLedgerSettlement(): boolean {
  if (env.VITE_REQUIRE_REAL_WALLET === "true") return true;
  if (env.VITE_APP_ENV === "production") return true;
  if (MAINNET_ROUTING_ENABLED) return true;
  return false;
}

/** Wallet connect on public marketing surfaces requires a Supabase session when auth is expected. */
export function walletConnectRequiresAccount(): boolean {
  return isSupabaseConfigured() && env.VITE_SUPABASE_AUTH !== "false";
}

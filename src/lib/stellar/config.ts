/**
 * Stellar network configuration — ENV defaults + Phase 6 effective routing.
 *
 * Runtime Horizon / passport / explorers use `getEffectiveStellarNetwork()`
 * (`src/lib/stellar/effective-network.ts`) so operators can migrate testnet pilots
 * to public ledger without ripping out the scaffold.
 */

import type { StellarNetwork } from "@/types/wallet";
import {
  ENV_STELLAR_NETWORK,
  MAINNET_ROUTING_ENABLED,
  activeIsTestnet,
  sidebarNetworkRibbon,
} from "./effective-network";

const env = import.meta.env;

export {
  ENV_STELLAR_NETWORK,
  MAINNET_ROUTING_ENABLED,
  activeIsPublicNetwork,
  activeIsTestnet,
  activeNetworkLabel,
  explorerAccountUrl,
  explorerTxUrl,
  getActiveHorizonUrl,
  getPassphraseLiterals,
} from "./effective-network";

export { explorerTxUrl as stellarExplorerTx } from "./effective-network";

export const BUILD_STELLAR_NETWORK: StellarNetwork = ENV_STELLAR_NETWORK;

if (BUILD_STELLAR_NETWORK !== "TESTNET" && !MAINNET_ROUTING_ENABLED) {
  console.warn(
    `[ROOTCHAIN] Build default network is "${BUILD_STELLAR_NETWORK}" but VITE_MAINNET_ROUTING_ENABLED is not true — runtime routing clamps PUBLIC to testnet.`,
  );
}

/** Back-compat Horizon URL tied to ENV only (analytics / health logs). Prefer getActiveHorizonUrl(). */
export const HORIZON_URL = env.VITE_STELLAR_HORIZON_URL ?? "https://horizon-testnet.stellar.org";

export const NETWORK_PASSPHRASE =
  env.VITE_STELLAR_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015";

export const SOROBAN_RPC = env.VITE_STELLAR_SOROBAN_RPC ?? "https://soroban-testnet.stellar.org";

export const SOROBAN_RPC_PUBLIC =
  env.VITE_STELLAR_SOROBAN_RPC_PUBLIC ?? env.VITE_STELLAR_PUBLIC_SOROBAN_RPC ?? "https://soroban-mainnet.stellar.org";

/** Active Soroban endpoint follows ledger selection except when explicitly overridden via env pairing. */
export function getActiveSorobanRpc(): string {
  return activeIsTestnet()
    ? SOROBAN_RPC
    : env.VITE_SOROBAN_RPC_ACTIVE ?? SOROBAN_RPC_PUBLIC;
}

export const USDC_ASSET_CODE = env.VITE_USDC_ASSET_CODE ?? "USDC";
export const USDC_ISSUER =
  env.VITE_USDC_ISSUER ?? "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

export const RC_ASSET_CODE = env.VITE_RC_ASSET_CODE ?? "RCSHARE";
export const RC_ISSUER =
  env.VITE_RC_ISSUER ?? "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

export function activeNetworkRibbon(): string {
  return sidebarNetworkRibbon();
}

export const FRIENDBOT_URL = "https://friendbot.stellar.org";


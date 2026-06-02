/**
 * Stellar network configuration — mainnet-first defaults.
 */

import type { StellarNetwork } from "@/types/wallet";
import {
  ENV_STELLAR_NETWORK,
  activeIsTestnet,
  sidebarNetworkRibbon,
  getActiveHorizonUrl,
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

/** @deprecated Prefer getActiveHorizonUrl() */
export const HORIZON_URL = getActiveHorizonUrl();

export const SOROBAN_RPC_PUBLIC =
  env.VITE_STELLAR_SOROBAN_RPC_PUBLIC ?? env.VITE_STELLAR_PUBLIC_SOROBAN_RPC ?? "https://soroban-mainnet.stellar.org";

export const SOROBAN_RPC = env.VITE_STELLAR_SOROBAN_RPC ?? "https://soroban-testnet.stellar.org";

export function getActiveSorobanRpc(): string {
  return activeIsTestnet() ? SOROBAN_RPC : SOROBAN_RPC_PUBLIC;
}

export function activeNetworkRibbon(): string {
  return sidebarNetworkRibbon();
}

/** Testnet-only funding helper URL (legacy dev). */
export const FRIENDBOT_URL = "https://friendbot.stellar.org";

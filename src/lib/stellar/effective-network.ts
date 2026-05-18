import type { StellarNetwork } from "@/types/wallet";
import { useStellarRuntimeStore } from "@/store/stellar-runtime.store";

const env = import.meta.env;

/** Build-time network default — never mutated at runtime without an explicit UI override + gate. */
export const ENV_STELLAR_NETWORK = (env.VITE_STELLAR_NETWORK ?? "TESTNET") as StellarNetwork;

export const MAINNET_ROUTING_ENABLED = env.VITE_MAINNET_ROUTING_ENABLED === "true";

const TESTNET_HORIZON = env.VITE_STELLAR_HORIZON_URL ?? "https://horizon-testnet.stellar.org";
const TESTNET_PASS = env.VITE_STELLAR_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015";

const PUBLIC_HORIZON = env.VITE_STELLAR_PUBLIC_HORIZON_URL ?? "https://horizon.stellar.org";

function trimEnv(value: unknown): string {
  if (typeof value !== "string") return "";
  const t = value.trim();
  return t.length ? t : "";
}

const USDC_MAINNET_CODE_DEFAULT = trimEnv(env.VITE_USDC_ASSET_CODE_MAINNET) || "USDC";
const RC_MAINNET_CODE_DEFAULT =
  trimEnv(env.VITE_RC_ASSET_CODE_MAINNET) || trimEnv(env.VITE_RC_ASSET_CODE) || "RCSHARE";
/**
 * Applies mainnet safeguards: PUBLIC selection only when explicitly enabled via env flag.
 */
function clipNetwork(net: StellarNetwork): StellarNetwork {
  if (net !== "PUBLIC") return net;
  if (!MAINNET_ROUTING_ENABLED) {
    if (import.meta.env.DEV) {
      console.info(
        "[ROOTCHAIN] Public network routing disabled — enable VITE_MAINNET_ROUTING_ENABLED=true for phased mainnet rollout.",
      );
    }
    return "TESTNET";
  }
  return net;
}

/**
 * Canonical active network layer for Horizon, explorers, and wallet alignment.
 */
export function getEffectiveStellarNetwork(): StellarNetwork {
  const prefs = useStellarRuntimeStore.getState().userNetworkOverride;
  const raw = prefs ?? ENV_STELLAR_NETWORK;
  return clipNetwork(raw);
}

export function activeIsPublicNetwork(): boolean {
  return getEffectiveStellarNetwork() === "PUBLIC";
}

export function activeIsTestnet(): boolean {
  return getEffectiveStellarNetwork() === "TESTNET";
}

export function activeNetworkLabel(): string {
  switch (getEffectiveStellarNetwork()) {
    case "TESTNET":
      return "Stellar Testnet";
    case "PUBLIC":
      return "Stellar Public (main)";
    case "FUTURENET":
      return "Stellar Futurenet";
    default:
      return "Stellar";
  }
}

export function sidebarNetworkRibbon(): string {
  switch (getEffectiveStellarNetwork()) {
    case "PUBLIC":
      return "AGRIFI · PUBLIC";
    case "FUTURENET":
      return "AGRIFI · FUTURENET";
    default:
      return "AGRIFI · TESTNET";
  }
}

export function getActiveHorizonUrl(): string {
  switch (getEffectiveStellarNetwork()) {
    case "PUBLIC":
      return PUBLIC_HORIZON;
    case "TESTNET":
      return TESTNET_HORIZON;
    case "FUTURENET":
      return env.VITE_STELLAR_FUTURENET_HORIZON_URL ?? "https://horizon-futurenet.stellar.org";
    default:
      return TESTNET_HORIZON;
  }
}

/** Passphrase string for forks / tooling that still compares raw strings against Freighter metadata. */
export function getPassphraseLiterals(): { testnet: string; futurenet?: string } {
  return {
    testnet: TESTNET_PASS,
    futurenet:
      env.VITE_STELLAR_FUTURENET_PASSPHRASE ?? "Test SDF Future Network ; October 2022",
  };
}



export function getActiveUsdcCode(): string {
  switch (getEffectiveStellarNetwork()) {
    case "PUBLIC":
      return USDC_MAINNET_CODE_DEFAULT;
    default:
      return trimEnv(env.VITE_USDC_ASSET_CODE) || "USDC";
  }
}

export function getActiveUsdcIssuer(): string {
  switch (getEffectiveStellarNetwork()) {
    case "PUBLIC":
      return (
        trimEnv(env.VITE_USDC_ISSUER_MAINNET) || trimEnv(env.VITE_STELLAR_PUBLIC_USDC_ISSUER)
      );
    default:
      return (
        trimEnv(env.VITE_USDC_ISSUER) ||
        "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
      );
  }
}

export function getActiveRcCode(): string {
  switch (getEffectiveStellarNetwork()) {
    case "PUBLIC":
      return RC_MAINNET_CODE_DEFAULT;
    default:
      return trimEnv(env.VITE_RC_ASSET_CODE) || "RCSHARE";
  }
}

/** Harvest-share style asset issuer for listings that mirror RC-SHARES on-chain. */
export function getActiveRcIssuer(): string {
  switch (getEffectiveStellarNetwork()) {
    case "PUBLIC":
      return trimEnv(env.VITE_RC_ISSUER_MAINNET) || trimEnv(env.VITE_STELLAR_PUBLIC_RC_ISSUER);
    default:
      return (
        trimEnv(env.VITE_RC_ISSUER) ||
        "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
      );
  }
}

export function mainnetIssuerConfigured(): boolean {
  if (!activeIsPublicNetwork()) return true;
  return Boolean(getActiveUsdcIssuer()) && Boolean(getActiveRcIssuer());
}

export function explorerTxUrl(hash: string): string {
  const h = hash.replace(/^0x/i, "").toLowerCase();
  const net = getEffectiveStellarNetwork();
  if (net === "PUBLIC") return `https://stellar.expert/explorer/public/tx/${h}`;
  if (net === "FUTURENET")
    return `https://stellar.expert/explorer/futurenet/tx/${h}`;
  return `https://stellar.expert/explorer/testnet/tx/${h}`;
}

export function explorerAccountUrl(publicKey: string): string {
  const net = getEffectiveStellarNetwork();
  if (net === "PUBLIC")
    return `https://stellar.expert/explorer/public/account/${publicKey}`;
  if (net === "FUTURENET")
    return `https://stellar.expert/explorer/futurenet/account/${publicKey}`;
  return `https://stellar.expert/explorer/testnet/account/${publicKey}`;
}

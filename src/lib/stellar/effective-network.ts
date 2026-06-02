import type { StellarNetwork } from "@/types/wallet";

const env = import.meta.env;

/** Build-time Stellar network — defaults to mainnet (PUBLIC). */
export const ENV_STELLAR_NETWORK = (env.VITE_STELLAR_NETWORK ?? "PUBLIC") as StellarNetwork;

/** Mainnet routing is on by default; set VITE_MAINNET_ROUTING_ENABLED=false only for legacy testnet dev. */
export const MAINNET_ROUTING_ENABLED = env.VITE_MAINNET_ROUTING_ENABLED !== "false";

const PUBLIC_HORIZON = env.VITE_STELLAR_PUBLIC_HORIZON_URL ?? "https://horizon.stellar.org";
const PUBLIC_PASS =
  env.VITE_STELLAR_PUBLIC_NETWORK_PASSPHRASE ?? "Public Global Stellar Network ; September 2015";

const TESTNET_HORIZON = env.VITE_STELLAR_HORIZON_URL ?? "https://horizon-testnet.stellar.org";
const TESTNET_PASS = env.VITE_STELLAR_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015";

function trimEnv(value: unknown): string {
  if (typeof value !== "string") return "";
  const t = value.trim();
  return t.length ? t : "";
}

/** Circle USDC on Stellar mainnet. */
const USDC_MAINNET_ISSUER_DEFAULT = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
const USDC_MAINNET_CODE_DEFAULT = trimEnv(env.VITE_USDC_ASSET_CODE_MAINNET) || "USDC";

/**
 * Resolves the active ledger. When mainnet routing is enabled (default), PUBLIC
 * is never downgraded to testnet.
 */
function resolveNetwork(): StellarNetwork {
  if (MAINNET_ROUTING_ENABLED) {
    return ENV_STELLAR_NETWORK === "TESTNET" || ENV_STELLAR_NETWORK === "FUTURENET"
      ? ENV_STELLAR_NETWORK
      : "PUBLIC";
  }
  return ENV_STELLAR_NETWORK === "PUBLIC" ? "TESTNET" : ENV_STELLAR_NETWORK;
}

/** Canonical active network for Horizon, explorers, and wallet alignment. */
export function getEffectiveStellarNetwork(): StellarNetwork {
  return resolveNetwork();
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
      return "Stellar Mainnet";
    case "FUTURENET":
      return "Stellar Futurenet";
    default:
      return "Stellar";
  }
}

export function sidebarNetworkRibbon(): string {
  switch (getEffectiveStellarNetwork()) {
    case "PUBLIC":
      return "AGRIFI · MAINNET";
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
      return PUBLIC_HORIZON;
  }
}

export function getActiveNetworkPassphrase(): string {
  switch (getEffectiveStellarNetwork()) {
    case "PUBLIC":
      return PUBLIC_PASS;
    case "TESTNET":
      return TESTNET_PASS;
    case "FUTURENET":
      return env.VITE_STELLAR_FUTURENET_PASSPHRASE ?? "Test SDF Future Network ; October 2022";
    default:
      return PUBLIC_PASS;
  }
}

export function getPassphraseLiterals(): { testnet: string; futurenet?: string } {
  return {
    testnet: TESTNET_PASS,
    futurenet: env.VITE_STELLAR_FUTURENET_PASSPHRASE ?? "Test SDF Future Network ; October 2022",
  };
}

export function getActiveUsdcCode(): string {
  return activeIsPublicNetwork()
    ? USDC_MAINNET_CODE_DEFAULT
    : trimEnv(env.VITE_USDC_ASSET_CODE) || "USDC";
}

export function getActiveUsdcIssuer(): string {
  if (activeIsPublicNetwork()) {
    return (
      trimEnv(env.VITE_USDC_ISSUER_MAINNET) ||
      trimEnv(env.VITE_STELLAR_PUBLIC_USDC_ISSUER) ||
      USDC_MAINNET_ISSUER_DEFAULT
    );
  }
  return trimEnv(env.VITE_USDC_ISSUER) || USDC_MAINNET_ISSUER_DEFAULT;
}

export function getActiveRcCode(): string {
  return activeIsPublicNetwork()
    ? trimEnv(env.VITE_RC_ASSET_CODE_MAINNET) || trimEnv(env.VITE_RC_ASSET_CODE) || "RCSHARE"
    : trimEnv(env.VITE_RC_ASSET_CODE) || "RCSHARE";
}

export function getActiveRcIssuer(): string {
  if (activeIsPublicNetwork()) {
    return trimEnv(env.VITE_RC_ISSUER_MAINNET) || trimEnv(env.VITE_STELLAR_PUBLIC_RC_ISSUER);
  }
  return trimEnv(env.VITE_RC_ISSUER) || USDC_MAINNET_ISSUER_DEFAULT;
}

export function mainnetIssuerConfigured(): boolean {
  if (!activeIsPublicNetwork()) return true;
  return Boolean(getActiveUsdcIssuer());
}

export function explorerTxUrl(hash: string): string {
  const h = hash.replace(/^0x/i, "").toLowerCase();
  const net = getEffectiveStellarNetwork();
  if (net === "PUBLIC") return `https://stellar.expert/explorer/public/tx/${h}`;
  if (net === "FUTURENET") return `https://stellar.expert/explorer/futurenet/tx/${h}`;
  return `https://stellar.expert/explorer/testnet/tx/${h}`;
}

export function explorerAccountUrl(publicKey: string): string {
  const net = getEffectiveStellarNetwork();
  if (net === "PUBLIC") return `https://stellar.expert/explorer/public/account/${publicKey}`;
  if (net === "FUTURENET") return `https://stellar.expert/explorer/futurenet/account/${publicKey}`;
  return `https://stellar.expert/explorer/testnet/account/${publicKey}`;
}

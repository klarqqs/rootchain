import { Networks } from "@stellar/stellar-sdk";
import { env } from "../config/env.js";

export type StellarNetworkName = "testnet" | "mainnet";

export function getStellarNetwork(): StellarNetworkName {
  return env.STELLAR_NETWORK;
}

export function isMainnet(): boolean {
  return env.STELLAR_NETWORK === "mainnet";
}

export function getHorizonUrl(): string {
  return isMainnet() ? env.STELLAR_HORIZON_URL_MAINNET : env.STELLAR_HORIZON_URL_TESTNET;
}

export function getNetworkPassphrase(): string {
  return isMainnet() ? env.STELLAR_PASSPHRASE_MAINNET : env.STELLAR_PASSPHRASE_TESTNET;
}

export function getNetworkPassphraseConst(): string {
  return isMainnet() ? Networks.PUBLIC : Networks.TESTNET;
}

export function getUsdcIssuer(): string {
  return isMainnet() ? env.USDC_ISSUER_MAINNET : env.USDC_ISSUER_TESTNET;
}

export function getPlatformEscrow(): string {
  const key = isMainnet() ? env.PLATFORM_ESCROW_MAINNET : env.PLATFORM_ESCROW_TESTNET;
  return (key ?? "").trim();
}

export const USDC_ASSET_CODE = "USDC";

export interface Transaction {
  hash: string;
  type: "INVEST" | "CLAIM" | "TRANSFER" | "DEPOSIT" | "WITHDRAW";
  produce: string;
  amount: number;
  time: string;
  status: "confirmed" | "pending" | "failed";
}

export const TX_HISTORY: Transaction[] = [
  { hash: "0x7a9f4dbe22dde6...c4e2", type: "INVEST", produce: "RC-0421", amount: 2400, time: "2 min ago", status: "confirmed" },
  { hash: "0xb421e8a92a0ebf...1d70", type: "CLAIM", produce: "RC-0512", amount: 1820, time: "1 hr ago", status: "confirmed" },
  { hash: "0x3f12abe64fbb76...8b91", type: "INVEST", produce: "RC-0388", amount: 5000, time: "4 hr ago", status: "confirmed" },
  { hash: "0xc8d4ff89172c20...44a3", type: "TRANSFER", produce: "RC-0476", amount: 1200, time: "Yesterday", status: "confirmed" },
  { hash: "0x9211bc06f1c93a...7e6c", type: "INVEST", produce: "RC-0301", amount: 3400, time: "2 days ago", status: "confirmed" },
  { hash: "0x4ee8d09b34b13d...9f33", type: "CLAIM", produce: "RC-0628", amount: 8200, time: "3 days ago", status: "confirmed" },
  { hash: "0x6f0a4dd8e927bb...2c19", type: "DEPOSIT", produce: "—", amount: 5000, time: "4 days ago", status: "confirmed" },
];

import type { WalletProviderId } from "@/types/wallet";

export interface WalletProvider {
  id: WalletProviderId;
  name: string;
  desc: string;
  color: string;
  popular?: boolean;
  recommended?: boolean;
  type: "Stellar";
}

/** Real Stellar wallet providers — no simulated or demo connections. */
export const WALLET_PROVIDERS: WalletProvider[] = [
  {
    id: "freighter",
    name: "Freighter",
    desc: "Stellar browser extension · primary wallet",
    color: "#7D00FF",
    type: "Stellar",
    recommended: true,
  },
  {
    id: "lobstr",
    name: "LOBSTR",
    desc: "LOBSTR signer extension · mobile wallet pairing",
    color: "#0197F6",
    type: "Stellar",
    popular: true,
  },
];

export interface WalletAsset {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  chg24h: number;
  color: string;
  icon?: string;
}

export const WALLET_ASSETS: WalletAsset[] = [
  { symbol: "USDC", name: "USD Coin", balance: 28247.18, usdValue: 28247.18, chg24h: 0.01, color: "#2775CA", icon: "$" },
  { symbol: "XLM", name: "Stellar Lumens", balance: 14820, usdValue: 1748.76, chg24h: 1.9, color: "#7D00FF", icon: "✦" },
  { symbol: "RC-SHARES", name: "Harvest Shares", balance: 142.4, usdValue: 8420.30, chg24h: 4.2, color: "#84CC16", icon: "♢" },
];

export const VERIFICATION_TIMELINE = [
  { stage: "Land Registry", time: "Jan 04, 2026 · 09:12 UTC", hash: "0x9a4f...e2c1", status: "confirmed" as const },
  { stage: "Seed Procurement Logged", time: "Jan 18, 2026 · 14:40 UTC", hash: "0x3b81...77d4", status: "confirmed" as const },
  { stage: "Investor Contract Deployed", time: "Feb 02, 2026 · 11:05 UTC", hash: "0x7a9f...c4e2", status: "confirmed" as const },
  { stage: "Milestone 1: Germination", time: "Feb 19, 2026 · 08:22 UTC", hash: "0x12bd...8a09", status: "confirmed" as const },
  { stage: "Milestone 2: Vegetative Growth", time: "Mar 08, 2026 · 16:14 UTC", hash: "0xee07...c3b1", status: "confirmed" as const },
  { stage: "Milestone 3: Tasseling", time: "Mar 27, 2026 · 10:48 UTC", hash: "0x4d22...91fa", status: "active" as const },
  { stage: "Milestone 4: Maturity", time: "Pending", hash: "—", status: "pending" as const },
  { stage: "Harvest & Distribution", time: "Pending", hash: "—", status: "pending" as const },
];

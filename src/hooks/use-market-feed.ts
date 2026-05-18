/**
 * Live market activity simulator.
 * Periodically injects synthetic events into the market store so the
 * landing page activity feed stays "alive" without a real backend.
 */

import { useEffect } from "react";
import { useMarketStore } from "@/store/market.store";
import type { LiveActivity } from "@/data/social";
import { PRODUCE_DATA } from "@/data/produce";

const INVESTORS = [
  "0x7a9f…c4e2",
  "0x3f12…8b91",
  "0xb421…1d70",
  "0xc8d4…44a3",
  "0x9211…7e6c",
];
const ASSETS = PRODUCE_DATA.map((p) => p.id);
const TYPES = ["invest", "claim", "milestone", "verify", "bridge"] as const;

function buildEntry(): LiveActivity {
  const investor = INVESTORS[Math.floor(Math.random() * INVESTORS.length)];
  const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
  const type = TYPES[Math.floor(Math.random() * TYPES.length)];
  const amount = (Math.floor(Math.random() * 50) + 1) * 100;
  let text = "";
  switch (type) {
    case "invest":
      text = `${investor} invested ${amount.toLocaleString()} USDC in ${asset}`;
      break;
    case "claim":
      text = `${investor} claimed ${amount.toLocaleString()} USDC from ${asset}`;
      break;
    case "milestone":
      text = `${asset} milestone ${1 + Math.floor(Math.random() * 4)} confirmed on-chain`;
      break;
    case "verify":
      text = `Field photo verified for ${asset} (IPFS QmX${Math.random().toString(36).slice(2, 5)}…)`;
      break;
    case "bridge":
      text = `Cross-chain bridge: ${amount.toLocaleString()} USDC settled to Stellar`;
      break;
  }
  return {
    id: `live_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    text,
    type,
    ts: "just now",
  };
}

/**
 * Drives the live activity feed at a configurable cadence.
 * Use a single instance (App.tsx) — multiple consumers will multiply the cadence.
 */
export function useMarketFeedSimulator(intervalMs = 4500) {
  const push = useMarketStore((s) => s.push);
  useEffect(() => {
    const id = setInterval(() => push(buildEntry()), intervalMs);
    return () => clearInterval(id);
  }, [push, intervalMs]);
}

export function useMarketFeed() {
  return useMarketStore((s) => s.activity);
}

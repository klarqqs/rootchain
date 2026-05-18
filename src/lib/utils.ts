import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatUsd = (n: number, opts: { compact?: boolean; decimals?: number } = {}) => {
  const { compact = false, decimals = 2 } = opts;
  if (compact && Math.abs(n) >= 1000) {
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    return `$${(n / 1000).toFixed(1)}K`;
  }
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};

export const formatPct = (n: number, decimals = 1) =>
  `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}%`;

export const truncateAddr = (addr: string, head = 6, tail = 4) =>
  addr.length <= head + tail ? addr : `${addr.slice(0, head)}…${addr.slice(-tail)}`;

export const truncateHash = (hash: string) => {
  const clean = hash.replace(/^0x/, "");
  return `0x${clean.slice(0, 6)}…${clean.slice(-4)}`;
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

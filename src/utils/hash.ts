/**
 * Deterministic random helpers used by the transaction simulator.
 * Kept in /utils so they're reusable for QR seeds, mock IDs, etc.
 */

/**
 * Generate a Stellar-format transaction hash (64-char lowercase hex).
 * Stellar uses SHA-256 of the signed envelope; we approximate that here.
 */
export function generateStellarHash(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Format a hash as `0x7a9f4d…c4e2` for display.
 * Phase 1 used 0x prefixes to match EVM aesthetics; we keep the convention.
 */
export function shortHash(hash: string, head = 6, tail = 4): string {
  if (!hash) return "—";
  const cleaned = hash.replace(/^0x/, "");
  return `0x${cleaned.slice(0, head)}…${cleaned.slice(-tail)}`;
}

/**
 * Generate a fake ledger number that monotonically increases on each call.
 */
let _ledger = 19_284_742;
export function nextLedger(): number {
  _ledger += 1 + Math.floor(Math.random() * 4);
  return _ledger;
}

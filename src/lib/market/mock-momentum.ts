/**
 * Deterministic + time-bucketed jitter for prototype “live” spot drift.
 * Replace with websocket price router without touching UI callers.
 */

export function jitterMomentumPct(listingId: string, baseline: number, bucketMs = 14_000): number {
  const t = Math.floor(Date.now() / bucketMs);
  let h = 2166136261;
  for (let i = 0; i < listingId.length; i++) {
    h ^= listingId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const phase = ((h >>> 0) % 1000) / 1000;
  const wave = Math.sin(t * 0.72 + phase * 6.283185307179586) * 0.52;
  return Math.round((baseline + wave) * 10) / 10;
}

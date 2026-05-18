/** Lightweight client-side throttle for transaction spam / fat-finger protection. */

export class ClientRateLimitError extends Error {
  constructor(message = "Too many requests — wait a moment and try again.") {
    super(message);
    this.name = "ClientRateLimitError";
  }
}

const buckets = new Map<string, number[]>();

export function assertClientRateLimit(
  key: string,
  maxEvents: number,
  windowMs: number,
): void {
  const now = Date.now();
  const prev = buckets.get(key) ?? [];
  const fresh = prev.filter((t) => now - t < windowMs);
  if (fresh.length >= maxEvents) {
    throw new ClientRateLimitError();
  }
  fresh.push(now);
  buckets.set(key, fresh);
}

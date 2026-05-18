/**
 * Mock API client.
 *
 * Phase 2 simulates a real fintech backend: every call has a small,
 * configurable latency, may surface errors, and supports cancellation.
 * Phase 3 will swap the implementation for fetch() against a real REST API
 * (Supabase / Firebase / custom). Call signatures will not change.
 */

const env = import.meta.env;
const DEFAULT_LATENCY_MS = Number(env.VITE_MOCK_LATENCY_MS ?? 600);
const DEFAULT_ERROR_RATE = Number(env.VITE_MOCK_ERROR_RATE ?? 0);

export interface MockOptions {
  /** Override the global default latency (ms). */
  latencyMs?: number;
  /** Override the global default failure probability (0–1). */
  errorRate?: number;
  /** AbortSignal — when triggered, the call rejects with a "Cancelled" error. */
  signal?: AbortSignal;
}

class MockApiError extends Error {
  code: string;
  constructor(message: string, code = "MOCK_API_ERROR") {
    super(message);
    this.name = "MockApiError";
    this.code = code;
  }
}

const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new MockApiError("Request cancelled", "CANCELLED"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new MockApiError("Request cancelled", "CANCELLED"));
    });
  });

const jitter = (base: number) =>
  Math.max(0, base + (Math.random() - 0.5) * base * 0.4);

/**
 * Wrap a synchronous "result producer" with simulated network latency and
 * an optional error injection. Use this for read-only mock endpoints.
 */
export async function mockGet<T>(produce: () => T, opts: MockOptions = {}): Promise<T> {
  const latency = opts.latencyMs ?? DEFAULT_LATENCY_MS;
  const errorRate = opts.errorRate ?? DEFAULT_ERROR_RATE;

  await sleep(jitter(latency), opts.signal);

  if (errorRate > 0 && Math.random() < errorRate) {
    throw new MockApiError(
      "Network error — please retry.",
      "MOCK_NETWORK_FAILURE",
    );
  }

  return produce();
}

/**
 * Same as mockGet, but slightly slower to mimic a write/commit round trip.
 */
export async function mockMutate<T>(produce: () => T, opts: MockOptions = {}): Promise<T> {
  return mockGet(produce, {
    ...opts,
    latencyMs: opts.latencyMs ?? DEFAULT_LATENCY_MS * 1.4,
  });
}

export { MockApiError };

/**
 * Generic polling utility.
 * Used by balance-sync and tx-sync as a robust fallback when
 * Horizon SSE streams are unavailable.
 */

export interface PollerOptions {
  /** Interval in ms between polls. */
  intervalMs: number;
  /** Fire immediately on start rather than waiting one full interval. */
  fireImmediately?: boolean;
  /** Callback to run on each tick. */
  fn: () => void | Promise<void>;
}

export interface Poller {
  start: () => void;
  stop: () => void;
  tick: () => Promise<void>;
}

export function createPoller(opts: PollerOptions): Poller {
  let timer: ReturnType<typeof setInterval> | null = null;
  let running = false;

  const tick = async () => {
    try {
      await opts.fn();
    } catch {
      // Swallow errors — individual pollers handle their own error state.
    }
  };

  return {
    start: () => {
      if (running) return;
      running = true;
      if (opts.fireImmediately) tick();
      timer = setInterval(tick, opts.intervalMs);
    },
    stop: () => {
      running = false;
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    },
    tick,
  };
}

/**
 * Realtime module entry point.
 *
 * Call startRealtime() after a successful wallet connect,
 * and stopRealtime() on disconnect or app teardown.
 */

export { createPoller } from "./poller";
export { startBalanceSync, stopBalanceSync, refreshBalancesNow } from "./balance-sync";
export { startTxSync, stopTxSync } from "./tx-sync";

import { startBalanceSync, stopBalanceSync } from "./balance-sync";
import { startTxSync, stopTxSync } from "./tx-sync";

/** Start all live-sync services. Call once after wallet connect. */
export function startRealtime() {
  startBalanceSync();
  startTxSync();
}

/** Stop all live-sync services. Call on wallet disconnect or unmount. */
export function stopRealtime() {
  stopBalanceSync();
  stopTxSync();
}

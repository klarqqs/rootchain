import { Horizon, Networks } from "@stellar/stellar-sdk";
import { getActiveHorizonUrl, getEffectiveStellarNetwork } from "./effective-network";

/**
 * Horizon client invalidated whenever the operator switches ledgers inside the SPA.
 */
let _server: Horizon.Server | null = null;
let _lastUrl = "";

export function invalidateHorizonClient(): void {
  _server = null;
  _lastUrl = "";
}

export function horizon(): Horizon.Server {
  const url = getActiveHorizonUrl();
  if (!_server || url !== _lastUrl) {
    _server = new Horizon.Server(url, { allowHttp: false });
    _lastUrl = url;
  }
  return _server;
}

export function networkPassphraseConst(): string {
  const net = getEffectiveStellarNetwork();
  switch (net) {
    case "TESTNET":
      return Networks.TESTNET;
    case "PUBLIC":
      return Networks.PUBLIC;
    case "FUTURENET":
      return Networks.FUTURENET;
    default:
      return Networks.TESTNET;
  }
}

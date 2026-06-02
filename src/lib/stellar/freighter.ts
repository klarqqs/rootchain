/**
 * Thin wrapper around @stellar/freighter-api.
 * Validates Freighter is aligned with the app's active Horizon network.
 */

import {
  getAddress,
  getNetworkDetails,
  isConnected as freighterIsConnected,
  isAllowed,
  requestAccess,
  setAllowed,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import { networkPassphraseConst } from "./client";
import type { Result } from "@/types/common";
import { err, ok } from "@/types/common";

export interface FreighterConnection {
  publicKey: string;
  network: string;
  networkPassphrase: string;
}

/** Returns true if the Freighter browser extension is detected. */
export async function isFreighterAvailable(): Promise<boolean> {
  try {
    const res = await freighterIsConnected();
    return Boolean(res.isConnected);
  } catch {
    return false;
  }
}

export async function isAccessAllowed(): Promise<boolean> {
  try {
    const res = await isAllowed();
    return Boolean(res.isAllowed);
  } catch {
    return false;
  }
}

const expectedPhrase = () => networkPassphraseConst();

/**
 * Full connection flow:
 * 1. Extension check
 * 2. Persist allow-list
 * 3. Align Freighter passphrase with ROOTCHAIN ledger selection (test/public/futurenet)
 */
export async function connectFreighter(): Promise<Result<FreighterConnection>> {
  if (!(await isFreighterAvailable())) {
    return err({
      name: "FreighterNotInstalled",
      message:
        "Freighter wallet was not detected. Install it from https://freighter.app and refresh.",
      code: "FREIGHTER_NOT_INSTALLED",
    });
  }

  if (!(await isAccessAllowed())) {
    try {
      await setAllowed();
    } catch {
      /* user can approve via requestAccess */
    }
  }

  const access = await requestAccess();
  if (access.error) {
    return err({
      name: "FreighterAccessRejected",
      message:
        access.error.message ??
        "Freighter permission was not granted. Try reconnecting.",
      code: "FREIGHTER_ACCESS_REJECTED",
    });
  }

  const addressRes = await getAddress();
  if (addressRes.error || !addressRes.address) {
    return err({
      name: "FreighterAddressUnavailable",
      message:
        addressRes.error?.message ??
        "Could not read your Stellar public key from Freighter.",
      code: "FREIGHTER_ADDRESS_UNAVAILABLE",
    });
  }

  const detailsRes = await getNetworkDetails();
  if (detailsRes.error) {
    return err({
      name: "FreighterNetworkUnavailable",
      message: detailsRes.error.message ?? "Could not read Freighter network details.",
      code: "FREIGHTER_NETWORK_UNAVAILABLE",
    });
  }

  const want = expectedPhrase();
  if (detailsRes.networkPassphrase && detailsRes.networkPassphrase !== want) {
    return err({
      name: "FreighterNetworkMismatch",
      message: `Freighter is on a different Stellar passphrase than ROOTCHAIN. Switch ROOTCHAIN ledger (sidebar) or change Freighter's network.`,
      code: "FREIGHTER_NETWORK_MISMATCH",
    });
  }

  return ok({
    publicKey: addressRes.address,
    network: detailsRes.network ?? "PUBLIC",
    networkPassphrase: detailsRes.networkPassphrase ?? want,
  });
}

export async function reconnectFreighterSilently(): Promise<Result<FreighterConnection>> {
  if (!(await isFreighterAvailable())) {
    return err({
      name: "FreighterNotInstalled",
      message: "Freighter is not installed.",
      code: "FREIGHTER_NOT_INSTALLED",
    });
  }
  if (!(await isAccessAllowed())) {
    return err({
      name: "FreighterAccessNotPersisted",
      message: "Permission has not been granted yet.",
      code: "FREIGHTER_NO_PERSISTED_ACCESS",
    });
  }
  return connectFreighter();
}

export async function signWithFreighter(
  xdr: string,
  publicKey: string,
): Promise<Result<string>> {
  const res = await freighterSignTransaction(xdr, {
    networkPassphrase: expectedPhrase(),
    address: publicKey,
  });
  if (res.error) {
    return err({
      name: "FreighterSigningRejected",
      message: res.error.message ?? "Signature rejected.",
      code: "FREIGHTER_SIGN_REJECTED",
    });
  }
  return ok(res.signedTxXdr);
}

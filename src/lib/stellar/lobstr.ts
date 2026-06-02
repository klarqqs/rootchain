/**
 * Thin wrapper around @lobstrco/signer-extension-api for LOBSTR signer extension.
 */

import { getPublicKey, isConnected, signTransaction } from "@lobstrco/signer-extension-api";
import type { Result } from "@/types/common";
import { err, ok } from "@/types/common";
import type { StellarNetwork } from "@/types/wallet";
import { getEffectiveStellarNetwork } from "@/lib/stellar/effective-network";

export interface LobstrConnection {
  publicKey: string;
  network: StellarNetwork;
}

const STELLAR_G_KEY = /^G[A-Z2-7]{55}$/;

function isValidStellarAddress(key: string): boolean {
  return STELLAR_G_KEY.test(key);
}

function activeNetwork(): StellarNetwork {
  return getEffectiveStellarNetwork();
}

/** True when the LOBSTR signer extension is installed. */
export async function isLobstrAvailable(): Promise<boolean> {
  try {
    return await isConnected();
  } catch {
    return false;
  }
}

/** Request the user's Stellar public key from LOBSTR. */
export async function connectLobstr(): Promise<Result<LobstrConnection>> {
  if (!(await isLobstrAvailable())) {
    return err({
      name: "LobstrNotInstalled",
      message:
        "LOBSTR signer extension was not detected. Install LOBSTR from https://lobstr.co and refresh this page.",
      code: "LOBSTR_NOT_INSTALLED",
    });
  }

  let publicKey: string;
  try {
    publicKey = await getPublicKey();
  } catch (e) {
    const message = e instanceof Error ? e.message : "LOBSTR connection was rejected.";
    return err({
      name: "LobstrAccessRejected",
      message,
      code: "LOBSTR_ACCESS_REJECTED",
    });
  }

  if (!publicKey || !isValidStellarAddress(publicKey)) {
    return err({
      name: "LobstrAddressUnavailable",
      message:
        "Could not read a valid Stellar public key from LOBSTR. Approve the connection in the extension.",
      code: "LOBSTR_ADDRESS_UNAVAILABLE",
    });
  }

  return ok({
    publicKey,
    network: activeNetwork(),
  });
}

export async function reconnectLobstrSilently(): Promise<Result<LobstrConnection>> {
  return connectLobstr();
}

export async function signWithLobstr(xdr: string): Promise<Result<string>> {
  if (!(await isLobstrAvailable())) {
    return err({
      name: "LobstrNotInstalled",
      message: "LOBSTR extension is not available.",
      code: "LOBSTR_NOT_INSTALLED",
    });
  }

  try {
    const signed = await signTransaction(xdr);
    if (!signed) {
      return err({
        name: "LobstrSigningRejected",
        message: "LOBSTR did not return a signed transaction.",
        code: "LOBSTR_SIGN_EMPTY",
      });
    }
    return ok(signed);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Signature rejected.";
    return err({
      name: "LobstrSigningRejected",
      message,
      code: "LOBSTR_SIGN_REJECTED",
    });
  }
}

import type { WalletProviderId } from "@/types/wallet";
import type { Result } from "@/types/common";
import { err } from "@/types/common";
import { signWithFreighter } from "@/lib/stellar/freighter";
import { signWithLobstr } from "@/lib/stellar/lobstr";

const REAL_SIGNING_PROVIDERS: WalletProviderId[] = ["freighter", "lobstr"];

export function isRealSigningProvider(provider: WalletProviderId): boolean {
  return REAL_SIGNING_PROVIDERS.includes(provider);
}

export async function signWithConnectedWallet(
  provider: WalletProviderId,
  xdr: string,
  publicKey: string,
): Promise<Result<string>> {
  if (provider === "freighter") {
    return signWithFreighter(xdr, publicKey);
  }
  if (provider === "lobstr") {
    return signWithLobstr(xdr);
  }
  return err({
    name: "UnsupportedWallet",
    message: "Only Freighter and LOBSTR support on-chain signing.",
    code: "UNSUPPORTED_WALLET",
  });
}

/**
 * Authentication service — Phase 2 keeps it minimal:
 * a wallet-bound mock session that proves the user signed something.
 * Phase 3 will swap to SEP-10 challenge/response with Horizon.
 */

import type { AuthSession } from "@/store/auth.store";
import { useAuthStore } from "@/store/auth.store";
import { useWalletStore } from "@/store/wallet.store";
import { generateStellarHash } from "@/utils/hash";
import { mockGet } from "@/api/client";
import type { Result } from "@/types/common";
import { err, ok } from "@/types/common";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24; // 24h

/**
 * Begin a SEP-10-style sign-in. Phase 2 fakes the challenge entirely.
 * Phase 3 will request a real SEP-10 challenge from the auth server
 * and route it through Freighter for signing.
 */
export async function signInWithWallet(): Promise<Result<AuthSession>> {
  const wallet = useWalletStore.getState();
  if (wallet.status !== "connected" || !wallet.account) {
    return err({
      name: "WalletNotConnected",
      message: "Connect a wallet before signing in.",
      code: "WALLET_NOT_CONNECTED",
    });
  }

  const { beginSignIn, completeSignIn } = useAuthStore.getState();
  beginSignIn();

  return mockGet(() => {
    const session: AuthSession = {
      publicKey: wallet.account!.publicKey,
      provider: wallet.account!.provider,
      issuedAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION_MS,
      token: generateStellarHash(),
    };
    completeSignIn(session);
    return ok(session);
  });
}

export function signOut() {
  useAuthStore.getState().signOut();
}

export function isAuthenticated(): boolean {
  const { status, isExpired } = useAuthStore.getState();
  return status === "authenticated" && !isExpired();
}

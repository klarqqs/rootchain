/**
 * Lightweight wallet-bound auth gate.
 *
 * Phase 2 — gates content behind a connected wallet. Falls back to a
 * Pill + CTA if disconnected. Use sparingly: most ROOTCHAIN pages already
 * handle the disconnected case inline (Wallet page, InvestModal, etc.),
 * so this component is for explicitly protected surfaces (admin tools,
 * the future "Farmer Portal", etc.).
 */

import { Lock, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { useWallet } from "@/hooks/use-wallet";
import { useAuthStore } from "@/store/auth.store";

interface AuthGateProps {
  /** When true, requires `useAuthStore` to be authenticated (sign-in completed). */
  requireSignIn?: boolean;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onConnect?: () => void;
  children: ReactNode;
}

export function AuthGate({
  requireSignIn = false,
  fallbackTitle = "Connect to continue",
  fallbackDescription = "This area is protected. Connect a Stellar wallet to view it.",
  onConnect,
  children,
}: AuthGateProps) {
  const { isConnected } = useWallet();
  const isAuthenticated = useAuthStore((s) => s.status === "authenticated");

  const ok = isConnected && (!requireSignIn || isAuthenticated);
  if (ok) return <>{children}</>;

  return (
    <Glass className="p-10 text-center max-w-xl mx-auto" glow>
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center">
        <Lock className="w-6 h-6 text-lime-400" />
      </div>
      <Pill color="ash">Wallet required</Pill>
      <h3 className="font-black text-2xl text-white mt-3">{fallbackTitle}</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
        {fallbackDescription}
      </p>
      {onConnect && (
        <div className="mt-5">
          <Btn variant="primary" icon={Wallet} onClick={onConnect}>
            Connect Wallet
          </Btn>
        </div>
      )}
    </Glass>
  );
}

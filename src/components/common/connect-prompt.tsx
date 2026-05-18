/**
 * Reusable "connect wallet" empty state.
 * Used on pages that require a connected wallet to show data.
 */

import { Wallet } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";

interface ConnectPromptProps {
  title?: string;
  description?: string;
  onConnect: () => void;
}

export function ConnectPrompt({
  title = "Connect to view your data",
  description = "Connect a Stellar wallet to access your portfolio, transactions, and investments.",
  onConnect,
}: ConnectPromptProps) {
  return (
    <Glass className="p-10 text-center max-w-lg mx-auto" glow>
      <div
        className="w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #84CC16, #166534)",
          boxShadow: "0 0 32px rgba(132,204,22,0.35)",
        }}
      >
        <Wallet className="w-7 h-7 text-black" strokeWidth={2.4} />
      </div>
      <Pill color="ash" className="mb-3">Wallet required</Pill>
      <h3 className="font-black text-xl text-white">{title}</h3>
      <p className="text-sm text-slate-500 mt-2 mb-6 max-w-xs mx-auto leading-relaxed">
        {description}
      </p>
      <Btn variant="primary" icon={Wallet} size="lg" onClick={onConnect}>
        Connect Wallet
      </Btn>
    </Glass>
  );
}

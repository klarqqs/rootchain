import { AlertTriangle, Rocket } from "lucide-react";
import { activeIsPublicNetwork } from "@/lib/stellar/effective-network";
import { publicEnv } from "@/lib/env";

export function DemoEnvironmentBanner() {
  const publicLedger = activeIsPublicNetwork();

  const showDemoStrip =
    publicEnv.demoMode || publicEnv.showcaseMode || publicEnv.appEnv === "staging";

  if (!showDemoStrip && !publicLedger) return null;

  return (
    <div className="relative z-40 flex flex-col">
      {publicLedger ? (
        <div
          className="border-b border-rose-500/35 bg-rose-500/[0.12] text-rose-50 text-[11px] font-bold px-4 py-2 flex items-center justify-center gap-2 text-center uppercase tracking-[0.18em]"
          role="status"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Public Horizon routing · irreversible settlements possible · escrow + issuer env must be audited before pilots.</span>
        </div>
      ) : null}
      {showDemoStrip ?
        <div
          className="border-b border-amber-500/30 bg-amber-500/[0.08] text-amber-100 text-xs font-bold px-4 py-2 flex items-center justify-center gap-2 text-center"
          role="status"
        >
          {publicEnv.showcaseMode ?
            <Rocket className="w-3.5 h-3.5 shrink-0" />
          : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
          <span>
            {publicEnv.showcaseMode
              ? "Showcase build"
              : publicEnv.demoMode
                ? "Demo sandbox"
                : publicEnv.appEnv === "staging"
                  ? "Staging"
                  : "Preview"}{" "}
            · default routing remains test-safe · confirm Freighter aligns with ROOTCHAIN ledger switcher · data may refresh between demos.
          </span>
        </div>
      : null}
    </div>
  );
}

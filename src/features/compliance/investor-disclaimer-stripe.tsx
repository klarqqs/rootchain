import { AlertTriangle } from "lucide-react";

interface InvestorDisclaimerStripeProps {
  compact?: boolean;
}

export function InvestorDisclaimerStripe({ compact }: InvestorDisclaimerStripeProps) {
  return (
    <div
      className={compact ? "rounded-xl border border-amber-500/25 bg-amber-400/[0.05] px-3 py-2" : ""}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <span className="font-bold text-amber-200">Regulatory framing · </span>
          ROOTCHAIN demos may route through Stellar public infrastructure when explicitly enabled via build-time operations flags.
          Returns are illustrative, escrow automation may still mirror client-side pacing, and issuer programs require independent legal diligence.
          Review the Compliance page before committing capital pilots.
        </p>
      </div>
    </div>
  );
}

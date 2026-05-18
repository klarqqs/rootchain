import { ClipboardList, Landmark, Shield } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import type { Page } from "@/lib/nav";

const phases = [
  {
    phase: "KYC-lite",
    summary: "Document vault + biometric options stay server-side via Supabase / partner custodians — never stash PII solely in SPA.",
    icon: Shield,
  },
  {
    phase: "Investor Suitability",
    summary: 'Surface jurisdiction-specific questionnaires before enabling VITE_MAINNET_ROUTING_ENABLED for any cohort-facing build.',
    icon: Landmark,
  },
  {
    phase: "Operational audit trail",
    summary: 'Operator console + activity feed already mimic SOC2-style evidence — export into warehouse when compliance stack goes live.',
    icon: ClipboardList,
  },
];

export function CompliancePage({ setPage }: { setPage: (page: Page) => void }) {
  return (
    <div className="space-y-5 pb-16 max-w-3xl mx-auto">
      <Glass className="p-6 elevated" glow>
        <h2 className="font-black text-3xl text-white tracking-tight mb-3">Responsible expansion checklist</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          ROOTCHAIN is architected like a regulated fintech: custody stays user-controlled via Freighter, attestations originate from cooperatives, while legal counsel still approves disclosures before broadcasting on public Horizon.
        </p>
      </Glass>
      <div className="space-y-4">
        {phases.map((p) => (
          <Glass key={p.phase} className="p-5 flex gap-4">
            <p.icon className="w-5 h-5 text-lime-200 shrink-0 mt-1" />
            <div>
              <div className="font-black text-lg text-white tracking-tight">{p.phase}</div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.summary}</p>
            </div>
          </Glass>
        ))}
      </div>
      <Glass className="p-6 text-center space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Need legal artefacts?</div>
        <Btn variant="outline" fullWidth className="min-h-[46px]" onClick={() => setPage("privacy")}>
          Open privacy policy
        </Btn>
      </Glass>
    </div>
  );
}

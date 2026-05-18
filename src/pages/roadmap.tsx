import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";

const PHASES = [
  { phase: "Phase 01–02", detail: "Design system + safe simulation rail" },
  { phase: "Phase 03", detail: "Live Stellar testnet + Horizon sync + Supabase hooks" },
  { phase: "Phase 04", detail: "Tokenized harvest scaffolding + escrow milestones" },
  { phase: "Phase 05", detail: "Security validation, onboarding, CI/CD + deployment hygiene" },
  { phase: "Next", detail: "Soroban-controlled escrow · regulated custody rails · NOAA/MRV ingestion" },
];

export function RoadmapPage() {
  return (
    <div className="space-y-5 pb-16 max-w-3xl mx-auto">
      <Glass className="p-6 space-y-3">
        <Pill color="sky">Stellar-aligned cadence</Pill>
        <h1 className="font-black text-3xl text-white tracking-tight">Product roadmap</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Public narrative for reviewers. Execution sequencing adapts based on accelerator milestones and issuer partnerships.
        </p>
      </Glass>
      <Glass className="p-6 space-y-4">
        {PHASES.map((row, idx) => (
          <div key={idx} className="flex gap-4 border-b border-white/[0.04] pb-4 last:border-0 last:pb-0">
            <div className="w-36 shrink-0 text-xs font-black uppercase tracking-wider text-lime-300">{row.phase}</div>
            <div className="text-sm text-slate-300">{row.detail}</div>
          </div>
        ))}
      </Glass>
    </div>
  );
}

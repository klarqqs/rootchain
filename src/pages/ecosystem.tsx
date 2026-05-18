import { Cpu, Landmark, Wheat } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";

const TILES = [
  {
    title: "Regional cooperatives",
    body: "Milestone disbursement APIs + QR verification bundles for farmers already tracking harvest provenance offline.",
    icon: Wheat,
  },
  {
    title: "NGO & impact auditors",
    body: "Exportable escrow ledgers simplify grant compliance while Stellar explorers remain the source-of-truth read layer.",
    icon: Landmark,
  },
  {
    title: "Stellar-aligned fintech rails",
    body: "USDC settlement primitives already flow through Horizon — extend with SEP standards + treasury APIs as issuance matures.",
    icon: Cpu,
  },
];

export function EcosystemPartnersPage() {
  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <Glass className="p-6 elevated" glow>
        <Pill color="purple" dot>
          Partnership scaffolding
        </Pill>
        <h2 className="font-black text-3xl text-white tracking-tight mt-3 mb-2">
          Ecosystem collaborators ship faster with shared rails.
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Operators can drop partner logos once MOUs exist — underneath, the escrow + issuance modules stay identical so engineering focus remains on onboarding & monitoring.
        </p>
      </Glass>
      <div className="grid md:grid-cols-3 gap-4">
        {TILES.map(({ title, body, icon: Icon }) => (
          <Glass key={title} className="p-5 space-y-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-lime-500/15 border border-lime-400/40"
              style={{ boxShadow: "0 0 20px rgba(132,204,22,0.25)" }}
            >
              <Icon className="w-5 h-5 text-lime-200" />
            </div>
            <div className="font-black text-xl text-white tracking-tight">{title}</div>
            <div className="text-xs text-slate-400 leading-relaxed">{body}</div>
          </Glass>
        ))}
      </div>
    </div>
  );
}

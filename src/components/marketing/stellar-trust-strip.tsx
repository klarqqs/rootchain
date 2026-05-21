import { Globe2, Lock, Shield, Zap } from "lucide-react";
import { Glass } from "@/components/ui/glass";

const ITEMS = [
  {
    icon: Lock,
    title: "Escrow protection",
    body: "Capital sits behind programmable release rules — not discretionary transfers.",
  },
  {
    icon: Shield,
    title: "Transparent transactions",
    body: "Every funding event and milestone attestation anchors to Stellar for audit-grade traceability.",
  },
  {
    icon: Zap,
    title: "Fast settlement",
    body: "USDC-native flows reduce correspondent friction so farmers and investors see cleared funds sooner.",
  },
  {
    icon: Globe2,
    title: "Global accessibility",
    body: "Diaspora and institutional LPs participate with the same rails as local cooperatives.",
  },
];

export function StellarTrustStrip() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <Glass className="relative overflow-hidden px-5 py-6 sm:px-8 sm:py-8 border-emerald-500/15">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "linear-gradient(90deg, rgba(16,185,129,0.08) 0%, transparent 35%, rgba(245,158,11,0.05) 100%)",
          }}
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          <div className="shrink-0">
            <div className="text-[10px] font-black tracking-[0.35em] uppercase text-emerald-400/90 mb-2">
              Infrastructure
            </div>
            <p className="font-black text-xl sm:text-2xl text-white tracking-tight leading-snug">
              Secured and verified on <span className="text-emerald-300">Stellar</span> blockchain.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            {ITEMS.map((it) => (
              <div
                key={it.title}
                className="rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3 hover:border-emerald-500/20 transition-colors"
              >
                <it.icon className="w-4 h-4 text-amber-200/85 mb-2" />
                <div className="text-sm font-bold text-white mb-1">{it.title}</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{it.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Glass>
    </section>
  );
}

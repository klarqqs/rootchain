import { motion } from "framer-motion";
import { Fingerprint, Radar, Satellite, Users } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";

const ADV = [
  {
    icon: Fingerprint,
    title: "Verified agricultural projects",
    body: "Operator-reviewed dossiers, on-chain hashes, and investor-ready disclosure packs.",
  },
  {
    icon: Satellite,
    title: "Blockchain transparency",
    body: "Funding, milestones, and distributions share a single Stellar audit trail investors can rely on.",
  },
  {
    icon: Radar,
    title: "Escrow-secured funding",
    body: "Smart milestone tracking releases capital only when field evidence clears governance thresholds.",
  },
  {
    icon: Users,
    title: "Fractional & community rails",
    body: "Marketplace integration and cooperative-friendly structures keep rural stakeholders in the loop.",
  },
];

export function AdvantagesGrid() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <Pill color="emerald">Why RootChain</Pill>
          <h2 className="font-black text-3xl lg:text-4xl text-white mt-2 tracking-tight">Built for operating scale.</h2>
        </div>
        <p className="text-sm text-slate-500 max-w-md leading-relaxed">
          We combine agronomic reality with settlement-grade infrastructure — so capital behaves like institutional
          finance while outcomes stay rooted in soil.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ADV.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <Glass className="p-5 h-full border-white/[0.04]" hover>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-amber-500/10 border border-white/[0.06] flex items-center justify-center mb-4">
                <a.icon className="w-5 h-5 text-emerald-200/90" />
              </div>
              <h3 className="font-bold text-white mb-2">{a.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{a.body}</p>
            </Glass>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

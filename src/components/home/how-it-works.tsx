import { motion } from "framer-motion";
import { Activity, BadgeCheck, ShieldCheck, Sprout } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";

const STEPS = [
  {
    n: "01",
    icon: Sprout,
    t: "Farm Tokenization",
    d: "Farmers register fields, soil quality, and yield estimates. Each harvest is minted as a fractional on-chain claim.",
  },
  {
    n: "02",
    icon: ShieldCheck,
    t: "Investor Verification",
    d: "ZK-proofs validate identity, escrow contracts lock USDC, and ownership shares mint to investor wallets.",
  },
  {
    n: "03",
    icon: Activity,
    t: "Milestone Tracking",
    d: "Geotagged sensors and verified field reports push milestones to chain. Funds release programmatically.",
  },
  {
    n: "04",
    icon: BadgeCheck,
    t: "Harvest Settlement",
    d: "At harvest, produce is distributed or sold; proceeds settle to investor wallets in USDC, audited end-to-end.",
  },
];

export function HowItWorks() {
  return (
    <section>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <Pill color="ash">Protocol</Pill>
          <h2 className="font-black text-3xl lg:text-4xl text-white mt-2 tracking-tight">
            How ROOTCHAIN works.
          </h2>
        </div>
        <p className="text-slate-500 max-w-md text-sm">
          Four phases connect a farm in Ogun to an investor in Singapore — without intermediaries.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Glass className="p-5 h-full" hover>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-lime-400" />
                </div>
                <span className="font-mono text-xs text-slate-600 tracking-wider">{s.n}</span>
              </div>
              <div className="font-black text-white mb-2">{s.t}</div>
              <div className="text-sm text-slate-500 leading-relaxed">{s.d}</div>
            </Glass>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

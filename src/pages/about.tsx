import { motion } from "framer-motion";
import { Globe2, Shield, Sprout, Users } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Btn } from "@/components/ui/button";
import type { Page } from "@/lib/nav";

export function AboutPage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="space-y-10 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Pill color="emerald" className="border-emerald-500/25">
          Company
        </Pill>
        <h1 className="font-black text-4xl lg:text-5xl text-white mt-3 tracking-tight">RootChain is the settlement layer for African agriculture.</h1>
        <p className="text-slate-400 text-lg mt-4 leading-relaxed">
          We connect verified producers with global capital through Stellar-native escrow, USDC settlement, and
          milestone governance designed for real field operations — not slide decks.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          {
            icon: Sprout,
            title: "Soil-first product",
            body: "Harvest programs, cooperative structures, and agronomic checkpoints shape our contracts — not the other way around.",
          },
          {
            icon: Shield,
            title: "Institutional rigor",
            body: "Disclosure, compliance scaffolding, and operator tooling so pilots can graduate into regulated markets.",
          },
          {
            icon: Users,
            title: "Community ownership",
            body: "Farmers retain narrative and economic agency while investors gain transparent, fractional participation.",
          },
          {
            icon: Globe2,
            title: "Continental ambition",
            body: "Built for cross-border diaspora capital, regional banks, and on-the-ground logistics partners alike.",
          },
        ].map((c, i) => (
          <motion.div key={c.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.05 }}>
            <Glass className="p-5 h-full border-white/[0.05]" hover>
              <c.icon className="w-5 h-5 text-amber-200/85 mb-3" />
              <h2 className="font-bold text-white mb-2">{c.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{c.body}</p>
            </Glass>
          </motion.div>
        ))}
      </div>

      <Glass className="p-6 border-emerald-500/15">
        <p className="text-slate-300 leading-relaxed">
          RootChain is developed as a premium AgriFi prototype with a credible path to production: Supabase-backed
          identity, Horizon-indexed balances, and Soroban-ready contract hooks. We are operator-led, farmer-informed,
          and investor-disciplined.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Btn variant="primary" onClick={() => setPage("launch")}>
            Join the pilot
          </Btn>
          <Btn variant="outline" onClick={() => setPage("ecosystem")}>
            Partnerships
          </Btn>
        </div>
      </Glass>
    </div>
  );
}

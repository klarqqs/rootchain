import { motion } from "framer-motion";
import {
  BadgeCheck,
  Banknote,
  Binoculars,
  ClipboardCheck,
  Sprout,
  Tractor,
  Wallet,
  Wheat,
} from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";

const INVESTOR = [
  { n: "01", icon: BadgeCheck, t: "Create account", d: "Verify identity and choose allocation — aligned to pilot KYC rails." },
  { n: "02", icon: Binoculars, t: "Browse verified farms", d: "Review diligence packs, sensor baselines, and escrow terms per listing." },
  { n: "03", icon: Wallet, t: "Invest with USDC", d: "Fund via wallet or simulated flows; capital locks into milestone-gated escrow on Stellar." },
  { n: "04", icon: Banknote, t: "Track returns & progress", d: "Live funding curves, harvest telemetry, and settlement receipts in one ledger trail." },
];

const FARMER = [
  { n: "01", icon: Tractor, t: "Register farm", d: "Map cooperative structure, acreage, and crop program for operator review." },
  { n: "02", icon: ClipboardCheck, t: "Submit verification", d: "Upload field evidence, certifications, and banking rails for attestation." },
  { n: "03", icon: Sprout, t: "Receive funding", d: "Capital releases as agronomic milestones confirm — no opaque disbursement windows." },
  { n: "04", icon: Wheat, t: "Deliver harvest milestones", d: "Close the loop with verified yield, offtake, and investor distributions." },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      data-landing-section="how-it-works"
      className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-[120px] py-16 lg:py-20 border-t border-white/[0.05]"
    >
      <div className="text-center max-w-2xl mx-auto mb-10">
        <Pill color="slate" className="border-white/10 text-slate-300">
          Dual rails
        </Pill>
        <h2 className="font-black text-3xl lg:text-4xl text-white mt-3 tracking-tight">How it works</h2>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
          One protocol — two journeys. Investors deploy with transparency; farmers fund operations without losing
          ownership narrative.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-black tracking-[0.25em] uppercase text-emerald-400/90">Investors</span>
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/40 to-transparent" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {INVESTOR.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Glass className="p-4 h-full border-emerald-500/10" hover>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <s.icon className="w-4 h-4 text-emerald-300" />
                    </div>
                    <span className="font-mono text-[10px] text-slate-600">{s.n}</span>
                  </div>
                  <div className="font-bold text-white text-sm mb-1.5">{s.t}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.d}</p>
                </Glass>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-black tracking-[0.25em] uppercase text-amber-200/90">Farmers</span>
            <div className="h-px flex-1 bg-gradient-to-r from-amber-500/35 to-transparent" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {FARMER.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Glass className="p-4 h-full border-amber-500/10" hover>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <s.icon className="w-4 h-4 text-amber-200/90" />
                    </div>
                    <span className="font-mono text-[10px] text-slate-600">{s.n}</span>
                  </div>
                  <div className="font-bold text-white text-sm mb-1.5">{s.t}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.d}</p>
                </Glass>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

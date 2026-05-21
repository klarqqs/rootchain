import { motion } from "framer-motion";
import { Pill } from "@/components/ui/pill";
import { PlatformVisualJourney } from "@/components/marketing/platform-visual-journey";

export function PlatformStory() {
  return (
    <section
      id="platform"
      data-landing-section="platform"
      className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-[120px] pt-10 pb-16 lg:pb-20"
    >
      <div className="space-y-10 lg:space-y-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-4"
          >
            <Pill color="ash" className="border-white/10 text-slate-300">
              What is RootChain
            </Pill>
            <h2 className="font-black text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              Agricultural finance with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-amber-100/90">
                ownership-grade
              </span>{" "}
              transparency.
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              The operating system above is what investors and cooperatives use daily — escrow, milestones, and
              settlement on one rail.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 text-slate-400 leading-relaxed text-sm lg:text-base"
          >
            <p>
              RootChain connects verified producers with global capital: funding locks in escrow, milestones publish to
              Stellar, and settlements stay explainable from soil to wallet —{" "}
              <span className="text-slate-200 font-semibold">so diligence is continuous, not a PDF drop.</span>
            </p>
          </motion.div>
        </div>

        <PlatformVisualJourney />

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          {[
            "Blockchain verification of field milestones",
            "Smart milestone tracking tied to disbursement",
            "Transparent funding curves and cap tables",
            "Real farm updates surfaced to capital partners",
            "Food security outcomes tied to measurable yield",
            "Investor–farmer trust system with operator oversight",
          ].map((line) => (
            <li
              key={line}
              className="flex gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 text-slate-400"
            >
              <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { ArrowRight, Landmark, Lock, ShieldCheck, Sprout, Tractor, Verified } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { HeroAfricaMap } from "@/components/marketing/hero-africa-map";
import { HeroProductMockup } from "@/components/marketing/hero-product-mockup";
import type { Page } from "@/lib/nav";
import { isSupabaseAuthEnforced } from "@/lib/auth-routes";
import { stashSignupPersonaRole } from "@/lib/signup-intent";

export interface HeroSectionProps {
  setPage: (p: Page) => void;
}

const TRUST = [
  { icon: Lock, label: "Escrow protected" },
  { icon: ShieldCheck, label: "Stellar secured" },
  { icon: Verified, label: "Verified farms" },
  { icon: Sprout, label: "Transparent funding" },
] as const;

const METRICS = [
  { v: "₦24.8M", l: "Capital funded" },
  { v: "412", l: "Verified farmers" },
  { v: "18", l: "Active projects" },
  { v: "14%", l: "Avg. ROI" },
] as const;

export function HeroSection({ setPage }: HeroSectionProps) {
  const goFarmerRegister = () => {
    if (isSupabaseAuthEnforced()) {
      stashSignupPersonaRole("farmer");
      setPage("signup");
      return;
    }
    setPage("register");
  };

  return (
    <section
      id="hero"
      data-landing-section="hero"
      className="relative overflow-hidden scroll-mt-[100px] min-h-[min(92vh,920px)] flex items-center py-12 lg:py-16"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 20% 20%, rgba(16,185,129,0.09), transparent 50%), radial-gradient(ellipse 50% 40% at 85% 30%, rgba(245,158,11,0.05), transparent 45%), linear-gradient(180deg, #050807 0%, #080c0a 45%, #050807 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute right-0 top-0 bottom-0 w-[55%] max-w-[720px] opacity-40 lg:opacity-100">
          <HeroAfricaMap />
        </div>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 xl:col-span-5 space-y-7 z-10"
          >
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-emerald-400/90">
              African agricultural finance infrastructure
            </p>

            <h1 className="font-black text-[2.35rem] sm:text-5xl lg:text-[3.15rem] xl:text-[3.4rem] text-white leading-[1.02] tracking-[-0.03em]">
              Transparent funding from{" "}
              <span className="text-slate-400">farm to </span>
              <span className="bg-gradient-to-r from-emerald-200 via-white to-emerald-100/80 bg-clip-text text-transparent">
                investor.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-md leading-relaxed font-medium">
              RootChain connects verified farmers and global investors through milestone-gated escrow, on-chain
              settlement, and continuous diligence — built on{" "}
              <span className="text-slate-300">Stellar</span> for fast, low-cost USDC rails.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Btn
                variant="primary"
                size="lg"
                icon={Landmark}
                iconRight={ArrowRight}
                onClick={() => setPage("marketplace")}
                className="shadow-[0_0_48px_-12px_rgba(16,185,129,0.5)]"
              >
                Start investing
              </Btn>
              <Btn variant="outline" size="lg" icon={Tractor} onClick={goFarmerRegister}>
                Register your farm
              </Btn>
            </div>

            <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
              {TRUST.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                  <Icon className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" strokeWidth={2.2} />
                  <span className="text-slate-400">{label}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 max-w-lg border-t border-white/[0.06]">
              {METRICS.map((m) => (
                <div key={m.l}>
                  <div className="font-black text-lg sm:text-xl text-white tabular-nums tracking-tight">{m.v}</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600 mt-0.5">{m.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 xl:col-span-7 relative z-10"
          >
            <HeroProductMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

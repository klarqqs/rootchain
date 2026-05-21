import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import type { Page } from "@/lib/nav";

export interface CTASectionProps {
  setPage: (p: Page) => void;
}

export function CTASection({ setPage }: CTASectionProps) {
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <Glass className="relative overflow-hidden p-8 lg:p-14 text-center border-emerald-500/15" glow elevated>
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(16,185,129,0.12), transparent 45%), radial-gradient(circle at 80% 80%, rgba(245,158,11,0.08), transparent 40%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-3xl mx-auto"
        >
          <Pill color="emerald" icon={Sparkles} className="border-emerald-500/25">
            Movement, not middleware
          </Pill>
          <h2 className="font-black text-3xl md:text-5xl text-white mt-4 tracking-tight leading-[1.08]">
            We&apos;ve made agricultural investment{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-amber-100/90">
              accessible for everyone.
            </span>
          </h2>
          <p className="text-slate-400 mt-5 text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
            Access verified farm opportunities, transparent funding systems, and blockchain-powered growth with
            confidence — built for farmers, investors, agronomists, logistics partners, and the cooperatives who feed
            communities.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Btn variant="primary" size="lg" iconRight={ArrowRight} onClick={() => setPage("signup")}>
              Get started
            </Btn>
            <Btn variant="outline" size="lg" onClick={() => setPage("marketplace")}>
              Explore farms
            </Btn>
          </div>
        </motion.div>
      </Glass>
    </section>
  );
}

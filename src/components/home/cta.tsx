import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Wallet } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Particles } from "@/components/layout/particles";
import type { Page } from "@/lib/nav";

interface CTAProps {
  setPage: (p: Page) => void;
  onConnectWallet: () => void;
}

export function CTA({ setPage, onConnectWallet }: CTAProps) {
  return (
    <section>
      <Glass className="relative overflow-hidden p-8 lg:p-14 text-center" glow elevated>
        <Particles count={20} />
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(132,204,22,0.18), transparent 60%), radial-gradient(circle at 50% 100%, rgba(22,101,52,0.18), transparent 60%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-2xl mx-auto"
        >
          <Pill color="lime" icon={Sparkles}>
            Limited early-investor allocation
          </Pill>
          <h2 className="font-black text-3xl md:text-5xl text-white mt-4 tracking-tight leading-tight">
            Plant capital. <br />
            <span className="text-gradient-lime">Harvest yield on-chain.</span>
          </h2>
          <p className="text-slate-400 mt-4 text-base lg:text-lg leading-relaxed max-w-xl mx-auto">
            Open your wallet, choose a verified harvest, and become an owner before the next season ends. Median ROI 21.4%, settled in USDC.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            <Btn variant="primary" size="lg" icon={Wallet} onClick={onConnectWallet}>
              Connect Wallet
            </Btn>
            <Btn variant="outline" size="lg" iconRight={ArrowRight} onClick={() => setPage("marketplace")}>
              Browse Marketplace
            </Btn>
          </div>
        </motion.div>
      </Glass>
    </section>
  );
}

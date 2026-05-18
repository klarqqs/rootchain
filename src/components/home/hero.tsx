import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Store,
  Wallet,
  Wheat,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Particles } from "@/components/layout/particles";
import { PORTFOLIO_CHART } from "@/data/market";
import type { Page } from "@/lib/nav";

interface HeroProps {
  setPage: (p: Page) => void;
  onConnectWallet: () => void;
}

export function Hero({ setPage, onConnectWallet }: HeroProps) {
  return (
    <section className="relative pt-6 lg:pt-12">
      <Particles count={36} />
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7 space-y-7"
        >
          <Pill color="lime" icon={Sparkles}>
            Live on Stellar · USDC Settled · ZK-verified yields
          </Pill>

          <h1 className="font-black text-5xl md:text-6xl lg:text-7xl text-white leading-[0.95] tracking-tight">
            Africa&apos;s Agricultural <br />
            Financial <span className="relative inline-block">
              <span className="text-gradient-lime">Infrastructure.</span>
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-slate-400 max-w-xl leading-relaxed">
            Tokenize verified harvests. Invest fractionally before yield ends. Settle in USDC, governed by smart contracts — auditable from soil to wallet.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Btn variant="primary" size="lg" icon={Store} iconRight={ArrowRight} onClick={() => setPage("marketplace")}>
              Explore Marketplace
            </Btn>
            <Btn variant="outline" size="lg" icon={DollarSign} onClick={() => setPage("marketplace")}>
              Invest Now
            </Btn>
            <Btn variant="ghost" size="lg" icon={Wallet} onClick={onConnectWallet}>
              Connect Wallet
            </Btn>
          </div>

          {/* Mini stats strip */}
          <div className="grid grid-cols-3 gap-3 pt-4 max-w-xl">
            {[
              { v: "$48.2M", l: "Total Volume" },
              { v: "1,284", l: "Farms On-chain" },
              { v: "21.4%", l: "Median ROI" },
            ].map((s) => (
              <div key={s.l} className="pl-4 border-l border-lime-500/20">
                <div className="font-black text-2xl text-white tabular-nums">{s.v}</div>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative">
            {/* Floating cards */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-2 sm:-left-6 z-20"
            >
              <Glass className="p-3 w-44" glow>
                <div className="flex items-center gap-2 mb-1">
                  <Wheat className="w-4 h-4 text-lime-400" />
                  <span className="text-[10px] font-bold tracking-wider text-slate-400">
                    MAIZE · RC-0421
                  </span>
                </div>
                <div className="font-black text-white text-sm tabular-nums">+$2,840.21</div>
                <div className="text-[10px] text-lime-400 font-bold inline-flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> 18.4% projected ROI
                </div>
              </Glass>
            </motion.div>

            <motion.div
              animate={{ y: [8, -8, 8] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -right-2 sm:-right-4 z-20"
            >
              <Glass className="p-3 w-48" glow>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-bold tracking-wider text-slate-400">
                    SMART CONTRACT
                  </span>
                </div>
                <div className="font-mono text-xs text-white truncate">0x7a9f4d…c4e2</div>
                <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 3/5 milestones confirmed
                </div>
              </Glass>
            </motion.div>

            {/* Main dashboard preview */}
            <Glass className="p-5 relative z-10" glow elevated>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">
                    Portfolio Value
                  </div>
                  <div className="font-black text-3xl text-white tabular-nums">$ 28,247.18</div>
                  <div className="text-xs font-bold text-lime-400 flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3 h-3" /> +$1,832.40 (7d)
                  </div>
                </div>
                <Pill color="lime" dot>
                  LIVE
                </Pill>
              </div>
              <div className="h-32 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PORTFOLIO_CHART} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                    <defs>
                      <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#84CC16" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#84CC16" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#84CC16" strokeWidth={2} fill="url(#heroGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-line">
                {[
                  { l: "Active", v: "12" },
                  { l: "Yield", v: "21.4%" },
                  { l: "Claims", v: "3" },
                ].map((m) => (
                  <div key={m.l}>
                    <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                      {m.l}
                    </div>
                    <div className="font-black text-white tabular-nums">{m.v}</div>
                  </div>
                ))}
              </div>
            </Glass>

            {/* Glow ring */}
            <div
              className="absolute inset-0 -z-10 blur-3xl opacity-40"
              style={{ background: "radial-gradient(circle, #84CC16, transparent 60%)" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

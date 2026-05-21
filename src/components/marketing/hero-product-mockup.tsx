import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  Shield,
  Sprout,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Glass } from "@/components/ui/glass";
import { PORTFOLIO_CHART } from "@/data/market";
import { cn } from "@/lib/utils";

const CHART = PORTFOLIO_CHART.slice(-8).map((d) => ({ ...d, v: d.v / 1000 }));

const PROJECTS = [
  { name: "Kaduna Rice Co-op", funded: 72, roi: 14.2, status: "Milestone 3/5" },
  { name: "Ashanti Cocoa Block", funded: 58, roi: 12.8, status: "Verified" },
] as const;

const TXS = [
  { label: "Escrow release", amt: "+₦420K", ok: true },
  { label: "USDC deposit", amt: "+$2,100", ok: true },
  { label: "Milestone audit", amt: "Pending", ok: false },
] as const;

function float(delay: number, y: number) {
  return {
    animate: { y: [0, y, 0] },
    transition: { duration: 7 + delay, repeat: Infinity, ease: "easeInOut" as const, delay },
  };
}

export function HeroProductMockup() {
  return (
    <div className="relative w-full max-w-[540px] mx-auto lg:mx-0 lg:ml-auto aspect-[4/5] sm:aspect-[5/6] min-h-[420px]">
      <div
        className="absolute inset-0 rounded-[2rem] opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle at 55% 40%, rgba(16,185,129,0.22), transparent 65%)" }}
      />

      {/* Main dashboard shell */}
      <motion.div
        {...float(0, -5)}
        className="absolute inset-x-4 top-6 bottom-16 z-10"
      >
        <Glass
          className="h-full p-4 sm:p-5 border-white/[0.08] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] flex flex-col"
          glow
          elevated
        >
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-emerald-300" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">RootChain OS</div>
                <div className="text-xs font-semibold text-slate-300">Investor workspace</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl bg-black/25 border border-white/[0.05] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Portfolio</div>
              <div className="font-black text-xl text-white tabular-nums mt-0.5">$18,420</div>
              <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +4.2% (30d)
              </div>
            </div>
            <div className="rounded-xl bg-black/25 border border-white/[0.05] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg ROI</div>
              <div className="font-black text-xl text-white tabular-nums mt-0.5">14%</div>
              <div className="text-[10px] text-slate-500 mt-1">18 active projects</div>
            </div>
          </div>

          <div className="rounded-xl bg-black/20 border border-white/[0.05] p-2 mb-3 h-[88px]">
            <div className="flex justify-between items-center px-1 mb-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Funding analytics</span>
              <TrendingUp className="w-3 h-3 text-emerald-400/80" />
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="heroOsChart" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#6ee7b7" strokeWidth={1.5} fill="url(#heroOsChart)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Active projects</div>
          <div className="space-y-2 flex-1 min-h-0">
            {PROJECTS.map((p) => (
              <div
                key={p.name}
                className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
              >
                <div className="flex justify-between gap-2 items-start">
                  <span className="text-xs font-bold text-slate-200 truncate">{p.name}</span>
                  <span className="text-[10px] font-bold text-emerald-400 shrink-0">{p.roi}% ROI</span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                    style={{ width: `${p.funded}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-slate-500">
                  <span>{p.funded}% funded</span>
                  <span className="text-slate-400">{p.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Recent activity</div>
            <div className="space-y-1.5">
              {TXS.map((t) => (
                <div key={t.label} className="flex justify-between text-[11px]">
                  <span className="text-slate-400">{t.label}</span>
                  <span className={cn("font-bold tabular-nums", t.ok ? "text-emerald-300" : "text-amber-200/90")}>
                    {t.amt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Glass>
      </motion.div>

      {/* Floating wallet card */}
      <motion.div
        {...float(0.4, 6)}
        className="absolute left-0 top-[18%] z-20 w-[148px]"
      >
        <Glass className="p-3 border-emerald-500/15 shadow-lg" glow>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            <Wallet className="w-3 h-3 text-emerald-400" />
            Wallet
          </div>
          <div className="font-black text-sm text-white tabular-nums">$4,280 USDC</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Stellar · synced</div>
        </Glass>
      </motion.div>

      {/* Verification */}
      <motion.div
        {...float(0.9, -5)}
        className="absolute right-0 top-[12%] z-20 w-[156px]"
      >
        <Glass className="p-3 border-white/[0.08] shadow-lg" glow>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            <BadgeCheck className="w-3 h-3 text-sky-400" />
            Verification
          </div>
          <div className="text-xs font-bold text-white">412 farms</div>
          <div className="text-[10px] text-emerald-400 font-bold mt-0.5">KYC + field audit</div>
        </Glass>
      </motion.div>

      {/* Escrow / funding */}
      <motion.div
        {...float(1.2, 4)}
        className="absolute right-2 bottom-[8%] z-20 w-[168px]"
      >
        <Glass className="p-3 border-amber-500/15 shadow-lg" glow>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            <Shield className="w-3 h-3 text-amber-200/90" />
            Escrow rail
          </div>
          <div className="font-black text-sm text-white tabular-nums">₦24.8M</div>
          <div className="text-[10px] text-slate-500">Total funded · pilot</div>
        </Glass>
      </motion.div>

      {/* ROI chip */}
      <motion.div
        {...float(0.6, -4)}
        className="absolute left-6 bottom-[4%] z-20"
      >
        <Glass className="px-3 py-2 flex items-center gap-2 border-white/[0.08]" glow>
          <CircleDollarSign className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Milestone</div>
            <div className="text-xs font-black text-white">3 / 5 released</div>
          </div>
        </Glass>
      </motion.div>
    </div>
  );
}

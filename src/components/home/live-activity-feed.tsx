import { motion } from "framer-motion";
import { Activity, ArrowDownRight, ArrowUpRight, CheckCircle2, Link2, Plus, ShieldCheck } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { LIVE_ACTIVITY, type LiveActivity } from "@/data/social";
import { cn } from "@/lib/utils";

const ICON_FOR_TYPE: Record<LiveActivity["type"], { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; ring: string }> = {
  invest: { icon: ArrowUpRight, color: "text-lime-400", bg: "bg-lime-500/10", ring: "border-lime-500/20" },
  claim: { icon: ArrowDownRight, color: "text-emerald-400", bg: "bg-emerald-500/10", ring: "border-emerald-500/20" },
  milestone: { icon: CheckCircle2, color: "text-sky-400", bg: "bg-sky-500/10", ring: "border-sky-500/20" },
  listing: { icon: Plus, color: "text-amber-400", bg: "bg-amber-500/10", ring: "border-amber-500/20" },
  bridge: { icon: Link2, color: "text-violet-400", bg: "bg-violet-500/10", ring: "border-violet-500/20" },
  verify: { icon: ShieldCheck, color: "text-lime-400", bg: "bg-lime-500/10", ring: "border-lime-500/20" },
};

export function LiveActivityFeed() {
  return (
    <section>
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <Pill color="emerald" icon={Activity} dot>
            Live Network
          </Pill>
          <h2 className="font-black text-3xl lg:text-4xl text-white mt-3 tracking-tight">
            The chain is alive.
          </h2>
          <p className="text-slate-500 mt-3 max-w-md leading-relaxed">
            Every investment, every milestone, every USDC transfer — all visible in real time. We don&apos;t take screenshots, we plug into the chain.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div>
              <div className="font-black text-2xl text-white tabular-nums">2,847</div>
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">
                Tx today
              </div>
            </div>
            <div className="h-10 w-px bg-line" />
            <div>
              <div className="font-black text-2xl text-white tabular-nums">$184K</div>
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">
                Settled 24h
              </div>
            </div>
          </div>
        </div>

        <Glass className="lg:col-span-8 p-5 max-h-[460px] overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-12 z-10 pointer-events-none bg-gradient-to-b from-[#0E1411] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-12 z-10 pointer-events-none bg-gradient-to-t from-[#0E1411] to-transparent" />

          <motion.div
            className="space-y-2 will-change-transform"
            animate={{ y: [0, -240] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            {[...LIVE_ACTIVITY, ...LIVE_ACTIVITY, ...LIVE_ACTIVITY].map((a, i) => {
              const meta = ICON_FOR_TYPE[a.type];
              const Icon = meta.icon;
              return (
                <div
                  key={`${a.id}-${i}`}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border bg-white/[0.02]",
                    "border-white/5",
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border",
                      meta.bg,
                      meta.ring,
                    )}
                  >
                    <Icon className={cn("w-4 h-4", meta.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-slate-200 font-mono truncate">{a.text}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">
                      {a.type} · {a.ts} ago
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </Glass>
      </div>
    </section>
  );
}

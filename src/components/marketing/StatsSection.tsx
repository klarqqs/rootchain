import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Activity, Globe, Sprout, TrendingUp, Users, Wallet } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { PLATFORM_STATS } from "@/data/social";

const ICONS: LucideIcon[] = [Wallet, Sprout, TrendingUp, Users, Activity, Globe];

export function StatsSection() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <Pill color="emerald" className="border-emerald-500/25">
          Network scale
        </Pill>
        <h2 className="font-black text-3xl lg:text-4xl text-white mt-3 tracking-tight">
          Capital and harvests, verified in the open.
        </h2>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
          Pilot metrics mirror what operators see internally — designed to converge with live Horizon data as you
          connect wallets.
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {PLATFORM_STATS.map((s, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Glass className="p-5 border-white/[0.04]" hover>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-emerald-300/90" />
                  </div>
                  <Pill color="ash" size="sm" className="text-amber-200/80 border-amber-500/15">
                    Live
                  </Pill>
                </div>
                <div className="font-black text-3xl lg:text-4xl text-white tabular-nums tracking-tight leading-none">
                  <AnimatedCounter
                    value={s.value}
                    decimals={s.decimals ?? 0}
                    prefix={s.prefix ?? ""}
                    suffix={s.suffix ?? ""}
                  />
                </div>
                <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-600 mt-2">{s.label}</div>
              </Glass>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

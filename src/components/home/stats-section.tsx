import { motion } from "framer-motion";
import { Activity, Globe, Sprout, TrendingUp, Users, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { PLATFORM_STATS } from "@/data/social";

const ICONS: LucideIcon[] = [Wallet, Sprout, TrendingUp, Users, Activity, Globe];

export function StatsSection() {
  return (
    <section>
      <div className="text-center mb-8 max-w-2xl mx-auto">
        <Pill color="lime">Live on-chain metrics</Pill>
        <h2 className="font-black text-3xl lg:text-4xl text-white mt-3 tracking-tight">
          Numbers that update with every harvest.
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Every data point below is verifiable on Stellar. We show you the same metrics our internal dashboard does.
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
              transition={{ delay: i * 0.06 }}
            >
              <Glass className="p-5" hover>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-lime-400" />
                  </div>
                  <Pill color="ash" size="sm">
                    24h
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
                <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500 mt-2">
                  {s.label}
                </div>
              </Glass>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { MARKET_INSIGHTS } from "@/data/market";
import { cn } from "@/lib/utils";

const IMPACT_COLOR = {
  Bullish: { color: "lime", icon: ArrowUpRight, ring: "border-lime-500/20", bg: "bg-lime-500/5" },
  Neutral: { color: "ash", icon: Minus, ring: "border-slate-500/20", bg: "bg-slate-500/5" },
  Bearish: { color: "rose", icon: ArrowDownRight, ring: "border-rose-500/20", bg: "bg-rose-500/5" },
} as const;

export function MarketInsights() {
  return (
    <Glass className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-lg text-white tracking-tight">Market Insights</h3>
          <div className="text-xs text-slate-500">Curated by ROOTCHAIN Research</div>
        </div>
        <Pill color="lime" dot>
          Auto-updated
        </Pill>
      </div>
      <div className="space-y-3">
        {MARKET_INSIGHTS.map((m, i) => {
          const c = IMPACT_COLOR[m.impact];
          const Icon = c.icon;
          return (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "p-4 rounded-xl border bg-white/[0.02] hover:bg-white/[0.04] transition group",
                "border-white/5 hover:border-lime-500/20",
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2">
                  <Pill color="ash" size="sm">
                    {m.region}
                  </Pill>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                      c.bg,
                      c.ring,
                      m.impact === "Bullish" ? "text-lime-300" : m.impact === "Bearish" ? "text-rose-300" : "text-slate-300",
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {m.impact}
                  </span>
                </div>
              </div>
              <div className="font-bold text-white text-sm">{m.title}</div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">{m.detail}</div>
            </motion.div>
          );
        })}
      </div>
    </Glass>
  );
}

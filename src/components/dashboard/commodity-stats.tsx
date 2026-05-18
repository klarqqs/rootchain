import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Glass } from "@/components/ui/glass";
import { COMMODITY_STATS } from "@/data/market";
import { cn, formatUsd } from "@/lib/utils";

export function CommodityStats() {
  return (
    <Glass className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-lg text-white tracking-tight">Commodity Pulse</h3>
          <div className="text-xs text-slate-500">Spot prices · 7d momentum</div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {COMMODITY_STATS.map((c) => {
          const data = c.trend.map((v, i) => ({ i, v }));
          const positive = c.chg24h >= 0;
          return (
            <div
              key={c.symbol}
              className="p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-lime-500/20 transition"
            >
              <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">{c.symbol}</div>
              <div className="font-bold text-white text-xs truncate mb-2">{c.name}</div>
              <div className="font-black text-white tabular-nums text-base">${c.price.toFixed(2)}</div>
              <div
                className={cn(
                  "text-[11px] font-bold tabular-nums",
                  positive ? "text-lime-400" : "text-rose-400",
                )}
              >
                {positive ? "▲" : "▼"} {Math.abs(c.chg24h).toFixed(1)}%
              </div>
              <div className="h-10 -mx-1 mt-1.5">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id={`mini-${c.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={positive ? "#84CC16" : "#F87171"} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={positive ? "#84CC16" : "#F87171"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={positive ? "#84CC16" : "#F87171"}
                      strokeWidth={1.5}
                      fill={`url(#mini-${c.symbol})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">7d vol {formatUsd(c.volume7d, { compact: true })}</div>
            </div>
          );
        })}
      </div>
    </Glass>
  );
}

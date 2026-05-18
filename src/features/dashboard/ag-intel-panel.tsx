import { useEffect, useState } from "react";
import { Brain, CloudRainWind, Gauge, LineChart as LineChartIcon, Sprout } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import type { AgIntelSnapshot } from "@/analytics/ag-intelligence.service";
import { fetchAgIntel } from "@/analytics/ag-intelligence.service";

export function AgIntelPanel() {
  const [intel, setIntel] = useState<AgIntelSnapshot | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAgIntel().then((snap) => {
      if (!alive) return;
      setIntel(snap);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Glass className="p-5">
      <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
        <div className="space-y-1">
          <Pill color="purple" icon={Brain}>
            Ag & market intelligence rail
          </Pill>
          <h3 className="font-black text-lg text-white tracking-tight">Signals desk (sandbox)</h3>
          <p className="text-xs text-slate-500">
            Deterministic mocks today — swaps cleanly for NOAA + exchange feeds when credentials land.
          </p>
        </div>
        {intel?.nextRefreshAtIso && (
          <span className="text-[11px] text-slate-500 font-mono">Last hydrate · {intel.nextRefreshAtIso}</span>
        )}
      </div>

      {!intel ? (
        <div className="text-sm text-slate-500 italic">Hydrating agronomic overlays…</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-2">
            <div className="flex items-center gap-2 font-black text-[11px] text-slate-500 uppercase tracking-wider">
              <Sprout className="w-4 h-4 text-lime-300" />
              Yield forecast
            </div>
            <div className="text-3xl font-black text-white tabular-nums">+{intel.yieldForecastPct.toFixed(1)}%</div>
            <div className="text-slate-400 leading-snug">Blended heuristic across ROOTCHAIN-listed pools.</div>
          </div>
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-2">
            <div className="flex items-center gap-2 font-black text-[11px] text-slate-500 uppercase tracking-wider">
              <CloudRainWind className="w-4 h-4 text-sky-300" />
              Weather
            </div>
            <div className="text-sm text-white leading-snug">{intel.weatherOutlook}</div>
          </div>
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-2">
            <div className="flex items-center gap-2 font-black text-[11px] text-slate-500 uppercase tracking-wider">
              <Gauge className="w-4 h-4 text-amber-300" />
              Scenario risk
            </div>
            <div className="text-sm text-white leading-snug">{intel.riskOutlook}</div>
            <div className="flex items-center gap-2 text-[11px] text-lime-200">
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>{intel.marketMomentum}</span>
            </div>
          </div>
        </div>
      )}
    </Glass>
  );
}

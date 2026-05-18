import { Eye, Landmark, Radar, UsersRound } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { computePlatformTransparency } from "@/transparency/platform-metrics";
import { formatUsd } from "@/lib/utils";

const SNAP = computePlatformTransparency();

export function TransparencyStrip() {
  return (
    <Glass className="p-4 lg:p-5">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Eye className="w-4 h-4 text-lime-300" />
            Live transparency rails
          </div>
          <div className="text-sm text-white font-black mt-1">Funding visibility · escrow choreography · oracle-ready logs</div>
        </div>
        <div className="flex flex-wrap gap-4 lg:gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-lime-300" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target stack</div>
              <div className="font-black text-white tabular-nums">{formatUsd(SNAP.totalTargetUsd)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-sky-300" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Funded runway</div>
              <div className="font-black text-white tabular-nums">{formatUsd(SNAP.totalFundedUsd)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UsersRound className="w-4 h-4 text-amber-200" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Investor exposures</div>
              <div className="font-black text-white tabular-nums">{SNAP.activeInvestorAccounts.toLocaleString()} touchpoints</div>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg fill</div>
            <div className="font-black text-lime-300 tabular-nums">{SNAP.avgFundingProgressPct.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Listings live</div>
            <div className="font-black text-white">{SNAP.liveListings}</div>
          </div>
        </div>
      </div>
    </Glass>
  );
}

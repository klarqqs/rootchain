import { Leaf, Sprout, TrendingUp, Users } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { computePlatformImpact } from "@/impact/platform-impact";
import { formatUsd } from "@/lib/utils";

const SNAP = computePlatformImpact();

export function ImpactHighlights() {
  return (
    <Glass className="p-4">
      <div className="flex flex-wrap gap-4 items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-lime-300" />
          <div>
            <div className="text-[10px] font-black uppercase text-slate-500">Listings</div>
            <div className="text-white font-black tabular-nums">{SNAP.produceListings}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-sky-300" />
          <div>
            <div className="text-[10px] font-black uppercase text-slate-500">Farmer pool</div>
            <div className="text-white font-black tabular-nums">{SNAP.farmerPool}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-200" />
          <div>
            <div className="text-[10px] font-black uppercase text-slate-500">Capital surfaced</div>
            <div className="text-white font-black tabular-nums">
              {formatUsd(SNAP.transparency.totalFundedUsd)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-300" />
          <div>
            <div className="text-[10px] font-black uppercase text-slate-500">Impact model*</div>
            <div className="text-emerald-200 font-black tabular-nums">
              ~{SNAP.modeledCarbonTonsAvoided}t CO₂e / {SNAP.modeledSmallholderFamilies} families
            </div>
          </div>
        </div>
        <div className="text-[10px] text-slate-600 w-full">
          *Illustrative heuristics for demo storytelling — replace with MRV partners before production claims.
        </div>
      </div>
    </Glass>
  );
}

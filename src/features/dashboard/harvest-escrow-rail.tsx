import { motion } from "framer-motion";
import { Landmark, Layers3, Radar, Stamp } from "lucide-react";
import type { Investment } from "@/types/portfolio";
import type { HarvestMilestone } from "@/types/milestone";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Btn } from "@/components/ui/button";
import { formatUsd } from "@/lib/utils";
import { escrowLockedUsd } from "@/tokenization/harvest-metrics";
import { describePlannedHarvestShare } from "@/tokenization/rc-asset-spec";

interface HarvestEscrowRailProps {
  positions: Investment[];
  onAdvance: (investmentId: string) => void;
  onOpenCertificate: (investment: Investment) => void;
}

function summarizeMilestones(ms?: HarvestMilestone[]) {
  if (!ms?.length) return { done: 0, total: 0 };
  return {
    total: ms.length,
    done: ms.filter((m) => m.status === "verified").length,
  };
}

export function HarvestEscrowRail({
  positions,
  onAdvance,
  onOpenCertificate,
}: HarvestEscrowRailProps) {
  const focus = [...positions].filter((p) => p.status !== "closed").slice(0, 3);

  if (focus.length === 0) return null;

  return (
    <Glass className="p-5">
      <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
        <div>
          <Pill color="lime" icon={Landmark}>
            Harvest ownership rails
          </Pill>
          <h3 className="font-black text-lg text-white tracking-tight mt-2">
            Escrow choreography + investor attestations
          </h3>
          <div className="text-xs text-slate-500 max-w-xl">
            Every position mirrors on-chain treasury movement with deterministic milestone disbursements —
            issuance metadata is scaffolded ahead of ROOTCHAIN-backed Stellar assets.
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        {focus.map((pos, idx) => {
          const { done, total } = summarizeMilestones(pos.milestones);
          const pct = total === 0 ? 0 : Math.round((done / total) * 100);
          const lockedUsd = escrowLockedUsd(pos.amount, pos.escrowReleasedPct ?? 0);
          const planned = describePlannedHarvestShare("RCSHARE", pos.produceId);

          const canAdvance =
            !!pos.milestones?.some((m) => m.status === "pending") && pos.status !== "closed";

          return (
            <motion.div
              key={pos.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-3xl bg-white/[0.02] border border-white/[0.04] p-4 flex flex-col gap-4"
            >
              <div>
                <div className="text-[11px] text-slate-500 font-black uppercase mb-1 tracking-wider">{pos.produceId}</div>
                <div className="font-black text-white text-base leading-snug">{pos.produceName}</div>
              </div>
              <div className="space-y-1 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Ownership slice</span>
                  <span className="font-mono text-lime-200 tabular-nums">
                    {(pos.ownershipPct ?? 0).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Token price / unit</span>
                  <span className="tabular-nums text-white font-bold">${(pos.tokenPriceUsd ?? 0).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Locked in escrow</span>
                  <span className="tabular-nums text-amber-200 font-black">{formatUsd(lockedUsd)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Harvest projection</span>
                  <span className="tabular-nums text-emerald-200 font-black">
                    {formatUsd(pos.projectedHarvestUsd ?? pos.amount)}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
                  <Radar className="w-3 h-3" />
                  Milestones · {done}/{total} ({pct}%)
                </div>
                <div className="w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-lime-500 via-emerald-400 to-cyan-300"
                    style={{ width: `${pct}%`, boxShadow: "0 0 16px rgba(132,204,22,0.45)" }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 rounded-2xl border border-white/5 p-3 space-y-1">
                <div className="flex items-center gap-2 font-bold text-white text-[10px] uppercase tracking-wider">
                  <Layers3 className="w-4 h-4 text-lime-300" />
                  Planned asset metadata
                </div>
                <div className="font-mono text-[10px] text-slate-400 break-all leading-relaxed">{planned.memoTemplate}</div>
                <div className="italic text-slate-500">{planned.description}</div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2">
                <Btn variant="ghost" icon={Stamp} size="sm" onClick={() => onOpenCertificate(pos)}>
                  Certificate
                </Btn>
                <Btn
                  variant="outline"
                  size="sm"
                  disabled={!canAdvance}
                  onClick={() => onAdvance(pos.id)}
                >
                  Verify milestone
                </Btn>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Glass>
  );
}

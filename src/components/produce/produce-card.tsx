import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Dot,
  MapPin,
  QrCode,
  Star,
  Calendar,
  UserPlus,
  Users,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ProduceItem, RiskLevel } from "@/data/produce";
import { getMarketFarmerByHandle, normalizeFarmerHandle } from "@/data/market-farmers";
import { Glass } from "@/components/ui/glass";
import { Btn } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { ProduceVisual } from "./produce-visual";
import { tokens } from "@/lib/tokens";
import { deriveInvestmentMinimumUsd, tokenPriceUsd } from "@/tokenization/harvest-metrics";
import { jitterMomentumPct } from "@/lib/market/mock-momentum";
import { useFarmerNetworkStore } from "@/store/farmer-network.store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const RISK_COLOR: Record<RiskLevel, "emerald" | "amber" | "rose"> = {
  Low: "emerald",
  Moderate: "amber",
  Higher: "rose",
};

function formatUsdWhole(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 10_000) return `$${Math.round(n / 1000)}K`;
  return `$${n.toLocaleString()}`;
}

interface ProduceCardProps {
  item: ProduceItem;
  index: number;
  onInvest: (item: ProduceItem) => void;
  onVerify: (item: ProduceItem) => void;
}

export function ProduceCard({ item, index, onInvest, onVerify }: ProduceCardProps) {
  const fundedPct = Math.round((item.funded / item.target) * 100);
  const unitUsd = tokenPriceUsd(item);
  const ticketUsd = deriveInvestmentMinimumUsd(item);
  const mf = useMemo(() => getMarketFarmerByHandle(item.farmerHandle), [item.farmerHandle]);
  const handleSlug = normalizeFarmerHandle(item.farmerHandle);
  const { push } = useToast();

  const [mom, setMom] = useState(() => jitterMomentumPct(item.id, item.momentumBaselinePct));
  useEffect(() => {
    const tick = () => setMom(jitterMomentumPct(item.id, item.momentumBaselinePct));
    tick();
    const id = window.setInterval(tick, 12_000);
    return () => window.clearInterval(id);
  }, [item.id, item.momentumBaselinePct]);

  const follow = useFarmerNetworkStore((s) => s.toggleFollow);
  const connect = useFarmerNetworkStore((s) => s.connectWith);
  const following = useFarmerNetworkStore((s) => !!s.following[handleSlug]);
  const connected = useFarmerNetworkStore((s) => !!s.connected[handleSlug]);

  const statusLabel =
    fundedPct >= 100 ? "Funded · settling" : fundedPct >= 92 ? "Closing soon" : "Open raise";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Glass className="p-4 group/card h-full flex flex-col hover:border-lime-500/20 transition-colors duration-300" hover glow>
        <ProduceVisual item={item} />

        <div className="pt-4 space-y-3 flex-1 flex flex-col">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-black text-base text-white leading-tight">{item.name}</h3>
              <div className="flex items-center gap-1 text-amber-400 shrink-0">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-bold tabular-nums">{item.quality}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              <Pill color="purple" icon={Sparkles}>{statusLabel}</Pill>
              <Pill
                color={mom >= 0 ? "emerald" : "rose"}
                icon={mom >= 0 ? ArrowUpRight : ArrowDownRight}
                className="tabular-nums"
              >
                {mom >= 0 ? "+" : ""}
                {mom.toFixed(1)}% drift
              </Pill>
            </div>

            {/* Farmer */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <div className="relative shrink-0">
                {mf ? (
                  <img
                    src={mf.portraitUrl}
                    alt={mf.displayName}
                    width={28}
                    height={28}
                    loading="lazy"
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full ring-1 ring-white/5 flex items-center justify-center font-black text-[9px] text-black"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}, ${tokens.forest})`,
                    }}
                  >
                    {item.farmer.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-300 block truncate">{item.farmer}</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin className="w-3 h-3 shrink-0" /> {item.farm}, {item.region}
                  <Dot className="w-3 h-3 shrink-0" />
                  {item.location}
                </span>
              </div>
            </div>

            {mf ? (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Pill color={mf.verified ? "lime" : "amber"}>
                  {mf.verified ? "ID verified farmer" : "Verification pending"}
                </Pill>
                <Pill color="ash" icon={Sparkles}>
                  {mf.harvestSuccessPct}% success · {mf.investorRating.toFixed(2)}★ investors · {mf.roundsFunded} rounds
                </Pill>
              </div>
            ) : (
              item.verified ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Pill color="lime">Verified listing</Pill>
                </div>
              ) : null
            )}
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-2.5 py-2 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Market feed (mock)</div>
            <div className="text-xs font-bold text-white leading-snug">{item.marketSpotLabel}</div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Pill color={RISK_COLOR[item.risk]}>{item.risk} risk</Pill>
            <Pill color="ash" icon={Calendar}>
              {item.daysToHarvest}d to harvest
            </Pill>
            <Pill color="sky">
              Floor {formatUsdWhole(ticketUsd)} ticket · {formatUsdWhole(unitUsd)} / unit
            </Pill>
            <Pill color="purple">{item.investorCount.toLocaleString()} investors</Pill>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Quantity</div>
              <div className="text-white font-bold tabular-nums truncate">{item.quantity}</div>
            </div>
            <div className="px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Harvest date</div>
              <div className="text-white font-bold truncate">{item.harvestDate}</div>
            </div>
            <div className="px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Est. payout pool</div>
              <div className="text-white font-black tabular-nums truncate">{formatUsdWhole(item.estimatedHarvestUsd)}</div>
            </div>
            <div
              className="px-2.5 py-2 rounded-lg border"
              style={{
                background: "rgba(132,204,22,0.06)",
                borderColor: "rgba(132,204,22,0.2)",
              }}
            >
              <div className="text-lime-400/70 text-[10px] font-bold uppercase tracking-wider">
                ROI model
              </div>
              <div className="text-lime-300 font-black tabular-nums">+{item.roi}% target</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Btn
              variant={following ? "outline" : "ghost"}
              size="sm"
              className={cn("flex-1 text-xs font-bold border-white/10", following && "text-lime-200 border-lime-500/35")}
              onClick={(e) => {
                e.stopPropagation();
                const was = following;
                follow(handleSlug);
                push({
                  tone: "success",
                  title: was ? "Muted updates" : "Tracking farm",
                  description: was
                    ? `Stopped surfacing realtime milestones for ${item.farmer}.`
                    : `Queueing biometric + rainfall attestations from ${item.farmer}'s coop.`,
                });
              }}
            >
              <Users className="w-4 h-4" /> {following ? "Following" : "Follow farmer"}
            </Btn>
            <Btn
              variant={connected ? "outline" : "dark"}
              size="sm"
              className={cn(
                "flex-1 text-xs font-bold border-white/10",
                connected && "text-emerald-200 border-emerald-500/30",
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (connected) {
                  push({
                    tone: "info",
                    title: "Already linked",
                    description: `${item.farmer}'s dossier mirrors your escrow rooms.`,
                  });
                  return;
                }
                connect(handleSlug);
                push({
                  tone: "info",
                  title: "Connection request queued",
                  description: `${item.farmer} accepts investor threads after harvest attestation.`,
                });
              }}
            >
              <UserPlus className="w-4 h-4" /> {connected ? "Connected" : "Connect"}
            </Btn>
          </div>

          <div className="mt-auto space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                Funding · {fundedPct}%
              </span>
              <span className="text-white font-bold tabular-nums">
                ${(item.funded / 1000).toFixed(1)}K / ${(item.target / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full relative"
                style={{
                  background: "linear-gradient(90deg, #65A30D, #84CC16, #BEF264)",
                  boxShadow: "0 0 12px rgba(132,204,22,0.6)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(fundedPct, 100)}%` }}
                transition={{ duration: 1.2, delay: index * 0.04 + 0.2, ease: "easeOut" }}
              >
                <div className="absolute inset-0 shimmer-loop opacity-60 rounded-full" />
              </motion.div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Btn variant="primary" icon={DollarSign} className="flex-1" onClick={() => onInvest(item)}>
              Invest USDC
            </Btn>
            <button
              onClick={() => onVerify(item)}
              className="w-10 h-10 rounded-xl border border-white/10 hover:border-lime-500/30 bg-white/5 hover:bg-lime-500/5 flex items-center justify-center transition shrink-0 focus-ring"
              title="QR Verify"
              aria-label={`Verify ${item.id}`}
            >
              <QrCode className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>
      </Glass>
    </motion.div>
  );
}

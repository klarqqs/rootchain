import { motion } from "framer-motion";
import {
  BadgeCheck,
  Calendar,
  DollarSign,
  MapPin,
  Sprout,
  TrendingUp,
  Users,
} from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import type { MarketplaceListing } from "@/types/marketplace";
import { cn, formatUsd } from "@/lib/utils";

function formatCropLabel(crop: string): string {
  if (!crop || crop === "other") return "General";
  return crop.charAt(0).toUpperCase() + crop.slice(1).replace(/_/g, " ");
}

interface ProjectCardProps {
  listing: MarketplaceListing;
  index: number;
  onInvest: (listing: MarketplaceListing) => void;
}

export function ProjectCard({ listing, index, onInvest }: ProjectCardProps) {
  const remaining = Math.max(0, listing.targetAmount - listing.raisedAmount);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.24) }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Glass className="p-0 h-full flex flex-col hover:border-lime-500/20 transition-colors overflow-hidden" hover glow>
        {listing.coverImageUrl ? (
          <div className="relative h-36 w-full overflow-hidden">
            <img
              src={listing.coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070a09] via-transparent to-transparent" />
          </div>
        ) : null}
        <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill color="lime" dot>
              Active
            </Pill>
            <Pill color="ash">{formatCropLabel(listing.cropType)}</Pill>
            {listing.riskLevel && (
              <Pill color={listing.riskLevel === "high" ? "rose" : listing.riskLevel === "low" ? "emerald" : "amber"}>
                {listing.riskLevel} risk
              </Pill>
            )}
            {listing.aiScore != null && (
              <Pill color="purple">AI {Math.round(listing.aiScore)}</Pill>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-lime-300 uppercase tracking-wider">
            <BadgeCheck className="w-3.5 h-3.5" />
            Verified
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 mb-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Farmer</div>
          <p className="font-black text-white text-sm leading-tight">{listing.farmer.name}</p>
          {listing.farmer.location ? (
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              {listing.farmer.location}
            </p>
          ) : null}
        </div>

        <h3 className="font-black text-lg text-white tracking-tight leading-snug">{listing.title}</h3>
        {(listing.location || listing.harvestTimeline) && (
          <p className="text-[11px] text-slate-500 mt-1">
            {listing.location && <span>{listing.location}</span>}
            {listing.location && listing.harvestTimeline && " · "}
            {listing.harvestTimeline && <span>Harvest {listing.harvestTimeline}</span>}
          </p>
        )}
        <p className="text-xs text-slate-500 mt-1 line-clamp-3 flex-1">{listing.description}</p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>Funding progress</span>
            <span className="text-lime-300 tabular-nums">{listing.fundingProgressPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                listing.fundingProgressPct >= 100 ? "bg-emerald-400" : "bg-lime-400",
              )}
              style={{ width: `${listing.fundingProgressPct}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-2">
              <div className="text-[10px] font-bold uppercase text-slate-500">Raised</div>
              <div className="font-black text-white tabular-nums">{formatUsd(listing.raisedAmount)}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-2">
              <div className="text-[10px] font-bold uppercase text-slate-500">Target</div>
              <div className="font-black text-white tabular-nums">{formatUsd(listing.targetAmount)}</div>
            </div>
          </div>
          {remaining > 0 && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-lime-400" />
              {formatUsd(remaining)} remaining to target
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {listing.startDate} → {listing.endDate}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-purple-300" />
              {listing.investorCount} investor{listing.investorCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <Btn
          variant="primary"
          icon={DollarSign}
          className="w-full mt-4"
          onClick={(e) => {
            e.stopPropagation();
            onInvest(listing);
          }}
        >
          Invest
        </Btn>
        </div>
      </Glass>
    </motion.article>
  );
}

interface VerifiedFarmersStripProps {
  farmers: Array<MarketplaceListing["farmer"] & { projectCount: number }>;
}

export function VerifiedFarmersStrip({ farmers }: VerifiedFarmersStripProps) {
  if (farmers.length === 0) return null;

  return (
    <div className="space-y-3">
      <Pill color="lime" icon={Sprout}>
        Verified farmers with live projects
      </Pill>
      <div className="flex gap-3 overflow-x-auto pb-1 mask-fade-x">
        {farmers.map((farmer) => (
          <Glass key={farmer.id} className="shrink-0 w-[240px] p-3">
            <div className="flex items-center gap-2 mb-1">
              <BadgeCheck className="w-4 h-4 text-lime-400" />
              <span className="font-bold text-white text-sm truncate">{farmer.name}</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{farmer.location || "—"}</p>
            <p className="text-[10px] font-bold text-lime-300 mt-2 uppercase tracking-wider">
              {farmer.projectCount} active project{farmer.projectCount === 1 ? "" : "s"}
            </p>
          </Glass>
        ))}
      </div>
    </div>
  );
}

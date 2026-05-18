import { motion } from "framer-motion";
import { Award, BadgeCheck, MapPin } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import type { FarmerProfile } from "@/database/types";
import { tokens } from "@/lib/tokens";
import { cn } from "@/lib/utils";

interface FarmerCardProps {
  farmer: FarmerProfile;
  index: number;
  onClick?: (farmer: FarmerProfile) => void;
}

export function FarmerCard({ farmer, index, onClick }: FarmerCardProps) {
  const funded = farmer.total_funded >= 1_000_000
    ? `$${(farmer.total_funded / 1_000_000).toFixed(1)}M`
    : `$${(farmer.total_funded / 1000).toFixed(0)}K`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.35) }}
      whileHover={{ y: -4 }}
    >
      <Glass
        className={cn("p-5 cursor-pointer h-full flex flex-col group")}
        hover
        glow={farmer.verified && index < 3}
        onClick={() => onClick?.(farmer)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-black text-base shrink-0 ring-1 ring-white/10"
              style={{ background: `linear-gradient(135deg, ${farmer.avatar_color ?? tokens.lime[500]}, ${tokens.forest})` }}
            >
              {farmer.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0">
              <div className="font-black text-white text-base flex items-center gap-1.5">
                <span className="truncate">{farmer.name}</span>
                {farmer.verified && (
                  <BadgeCheck className="w-4 h-4 text-lime-400 shrink-0" />
                )}
              </div>
              <div className="text-xs text-slate-500 truncate">@{farmer.handle}</div>
            </div>
          </div>
          {farmer.verified ? (
            <Pill color="lime" icon={Award}>Verified</Pill>
          ) : (
            <Pill color="ash">Pending</Pill>
          )}
        </div>

        {/* Farm + location */}
        <div className="text-sm font-bold text-slate-300 truncate mb-1">{farmer.farm_name}</div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{farmer.location}</span>
          <span className="shrink-0 text-slate-600">· {farmer.region}</span>
        </div>

        {/* Bio */}
        {farmer.bio && (
          <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3 flex-1">
            {farmer.bio}
          </p>
        )}

        {/* Specialties */}
        {farmer.specialties && farmer.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {farmer.specialties.slice(0, 3).map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.04] text-slate-300 border border-white/10"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Farmer assurance — Phase 4 trust rail */}
        <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] px-3 py-3 space-y-2 mb-4">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Farmer assurance deck</div>
          <div className="flex flex-wrap gap-3 justify-between text-xs">
            <div>
              <div className="text-slate-500 text-[10px] font-bold uppercase">Verification tier</div>
              <div className="text-white font-bold capitalize">{farmer.verification_tier ?? "community"}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] font-bold uppercase">Harvest streak</div>
              <div className="font-black text-emerald-200 tabular-nums">
                {farmer.harvest_success_rate ?? 82}%
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] font-bold uppercase">Reputation</div>
              <div className="flex items-center gap-2 mt-1 w-full max-w-[140px]">
                <span className="font-black text-lime-200 tabular-nums">{farmer.reputation_score ?? "—"}</span>
                <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-lime-500 to-emerald-400"
                    style={{ width: `${Math.min(100, farmer.reputation_score ?? 0)}%` }}
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] font-bold uppercase">Geo signal</div>
              <div className="font-bold text-sky-300">{farmer.location_verified ? "Verified AOI" : "Pending"}</div>
              <div className="text-[10px] text-slate-500">{farmer.seasons_active ?? 0}+ anchored seasons</div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-line">
          <div className="text-center">
            <div className="font-black text-white tabular-nums">{farmer.total_harvests}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Harvests</div>
          </div>
          <div className="text-center">
            <div className="font-black text-lime-300 tabular-nums">{funded}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Funded</div>
          </div>
          <div className="text-center">
            <div className="font-black text-white tabular-nums">{farmer.active_listings}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active</div>
          </div>
        </div>
      </Glass>
    </motion.div>
  );
}

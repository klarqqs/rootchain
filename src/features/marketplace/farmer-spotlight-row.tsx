import { motion } from "framer-motion";
import { BadgeCheck, MapPin, Star, UserPlus, Users } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import type { MarketFarmerProfile } from "@/data/market-farmers";
import { MARKET_FARMERS } from "@/data/market-farmers";
import { useFarmerNetworkStore } from "@/store/farmer-network.store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function FarmerMiniCard({ f, i }: { f: MarketFarmerProfile; i: number }) {
  const { push } = useToast();
  const handle = f.handle;
  const follow = useFarmerNetworkStore((s) => s.toggleFollow);
  const connect = useFarmerNetworkStore((s) => s.connectWith);
  const isFollowing = useFarmerNetworkStore((s) => !!s.following[handle]);
  const isConnected = useFarmerNetworkStore((s) => !!s.connected[handle]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(i * 0.05, 0.25) }}
      className="shrink-0 w-[260px] snap-start"
    >
      <Glass className="p-3.5 h-full flex flex-col gap-2.5 group" hover>
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <img
              src={f.portraitUrl}
              alt={f.displayName}
              width={56}
              height={56}
              loading="lazy"
              className="w-14 h-14 rounded-xl object-cover ring-1 ring-white/10"
            />
            {f.verified && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-lime-400 text-black flex items-center justify-center ring-2 ring-[#0E1411]">
                <BadgeCheck className="w-3 h-3" strokeWidth={2.8} aria-hidden />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 flex-wrap">
              <div className="font-black text-sm text-white truncate">{f.displayName}</div>
              <Pill color="ash">{f.yearsExperience} yrs</Pill>
            </div>
            <div className="text-[11px] text-slate-500 font-bold truncate">@{handle}</div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{f.location}</span>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{f.bio}</p>
        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <div className="rounded-lg bg-white/[0.02] border border-white/5 px-2 py-1.5 text-center">
            <div className="text-white tabular-nums text-xs">{f.harvestSuccessPct}%</div>
            <div>Harvest</div>
          </div>
          <div className="rounded-lg bg-white/[0.02] border border-white/5 px-2 py-1.5 text-center">
            <div className="text-amber-300 tabular-nums text-xs inline-flex items-center justify-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-300 text-amber-300" aria-hidden /> {f.investorRating.toFixed(1)}
            </div>
            <div>Rating</div>
          </div>
          <div className="rounded-lg bg-white/[0.02] border border-white/5 px-2 py-1.5 text-center">
            <div className="text-white tabular-nums text-xs">{f.roundsFunded}</div>
            <div>Funded</div>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 font-semibold truncate">{f.specialty}</div>
        <div className="flex gap-2 mt-auto">
          <Btn
            variant={isFollowing ? "outline" : "ghost"}
            size="sm"
            className={cn(
              "flex-1 text-xs",
              isFollowing && "border-lime-500/40 bg-lime-500/10 text-lime-200",
            )}
            onClick={() => {
              const was = isFollowing;
              follow(handle);
              push({
                tone: "success",
                title: was ? "Alerts paused" : "Following cohort",
                description: was
                  ? `${f.displayName} will no longer get priority pings in your feed.`
                  : `You’ll inherit portfolio milestones from ${f.displayName}.`,
              });
            }}
          >
            <Users className="w-3.5 h-3.5" aria-hidden /> {isFollowing ? "Following" : "Follow"}
          </Btn>
          <Btn
            variant={isConnected ? "outline" : "primary"}
            size="sm"
            className={cn(
              "flex-1 text-xs",
              isConnected ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-200" : "",
            )}
            onClick={() => {
              if (isConnected) {
                push({
                  tone: "info",
                  title: "Already connected",
                  description: `${f.displayName} is in your investor sync list.`,
                });
                return;
              }
              connect(handle);
              push({
                tone: "info",
                title: "Connection staged",
                description: `Escrow-visible chat + sensor rooms unlock after ${f.displayName} accepts (pilot messaging).`,
              });
            }}
          >
            <UserPlus className="w-3.5 h-3.5" aria-hidden /> {isConnected ? "Synced" : "Connect"}
          </Btn>
        </div>
      </Glass>
    </motion.div>
  );
}

/** Popular farmers surfaced from rating-sorted deterministic seed data — swap for API hydrate. */
export function FarmerSpotlightRow() {
  const sorted = [...MARKET_FARMERS].sort((a, b) => b.investorRating - a.investorRating).slice(0, 10);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <Pill color="purple" icon={Star}>
          Popular Farmers
        </Pill>
        <span className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
          Live African network · escrow-rated
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 px-1 -mx-1 snap-x mask-fade-x">
        {sorted.map((f, i) => (
          <FarmerMiniCard key={f.handle} f={f} i={i} />
        ))}
      </div>
    </div>
  );
}

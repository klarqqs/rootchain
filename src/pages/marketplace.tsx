import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Filter,
  Globe,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sprout,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { ProduceCard } from "@/components/produce/produce-card";
import {
  CATEGORIES,
  PRODUCE_DATA,
  marketplaceTotals,
  recentlyFundedProduce,
  trendingProduce,
  type ProduceItem,
  type RiskLevel,
} from "@/data/produce";
import { deriveInvestmentMinimumUsd } from "@/tokenization/harvest-metrics";
import { useMarketFeed } from "@/hooks/use-market-feed";
import { FarmerSpotlightRow } from "@/features/marketplace/farmer-spotlight-row";
import { LIVE_ACTIVITY } from "@/data/social";
import { cn } from "@/lib/utils";
import { ImpactHighlights } from "@/features/marketplace/impact-highlights";
import { getMarketFarmerByHandle } from "@/data/market-farmers";

interface MarketplacePageProps {
  onInvest: (item: ProduceItem) => void;
  onVerify: (item: ProduceItem) => void;
  setUploadOpen: (open: boolean) => void;
}

type SortBy = "trending" | "roi" | "quality" | "growth" | "ending-soon";

const RISK_ALL: RiskLevel[] = ["Low", "Moderate", "Higher"];

function MarketplaceSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <Glass key={i} className="p-4 h-[620px] flex flex-col gap-3 animate-pulse">
          <div className="h-44 rounded-xl bg-white/[0.04]" />
          <div className="h-4 w-[68%] max-w-[14rem] rounded-lg bg-white/[0.04]" />
          <div className="h-3 w-5/12 rounded-lg bg-white/[0.04]" />
          <div className="grid grid-cols-2 gap-2 flex-1">
            <div className="rounded-lg bg-white/[0.02] h-full" />
            <div className="rounded-lg bg-white/[0.02] h-full" />
          </div>
          <div className="h-10 rounded-xl bg-white/[0.04]" />
        </Glass>
      ))}
    </div>
  );
}

export function MarketplacePage({ onInvest, onVerify, setUploadOpen }: MarketplacePageProps) {
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortBy>("trending");

  const [roiMin, setRoiMin] = useState<number>(10);
  const [roiMax, setRoiMax] = useState<number>(90);
  const [maxTicket, setMaxTicket] = useState<number>(75000);
  const [harvestWithin, setHarvestWithin] = useState<number>(800);
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [riskAllow, setRiskAllow] = useState<RiskLevel[]>(["Low", "Moderate", "Higher"]);
  const [verifiedFarmersOnly, setVerifiedFarmersOnly] = useState(false);

  const [advOpen, setAdvOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setShowGrid(true), 420);
    return () => window.clearTimeout(t);
  }, []);

  const regions = useMemo(() => {
    const s = new Set(PRODUCE_DATA.map((p) => p.region));
    return [...s];
  }, []);

  const liveActivity = useMarketFeed();

  const filtered = useMemo(() => {
    let r = PRODUCE_DATA.filter((p) => {
      const passCat = cat === "all" || p.category === cat;
      const passQ =
        q === "" ||
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.farmer.toLowerCase().includes(q.toLowerCase()) ||
        p.id.toLowerCase().includes(q.toLowerCase()) ||
        p.marketSpotLabel.toLowerCase().includes(q.toLowerCase());
      const roiPass = p.roi >= roiMin && p.roi <= roiMax;
      const ticketUsd = deriveInvestmentMinimumUsd(p);
      const ticketPass = ticketUsd <= maxTicket;
      const harvestPass = p.daysToHarvest <= harvestWithin;
      const regionPass = regionFilter === "all" || p.region === regionFilter;
      const profile = getMarketFarmerByHandle(p.farmerHandle);
      const farmerVerifiedProfile = profile?.verified ?? false;
      const mfMatch = !verifiedFarmersOnly || (farmerVerifiedProfile && p.verified);

      const risksAllSelected =
        riskAllow.length === RISK_ALL.length && RISK_ALL.every((r) => riskAllow.includes(r));
      const riskPass = risksAllSelected || riskAllow.includes(p.risk);

      return (
        passCat &&
        passQ &&
        roiPass &&
        ticketPass &&
        harvestPass &&
        regionPass &&
        mfMatch &&
        riskPass
      );
    });

    if (sort === "roi") r = [...r].sort((a, b) => b.roi - a.roi);
    else if (sort === "quality") r = [...r].sort((a, b) => b.quality - a.quality);
    else if (sort === "growth") r = [...r].sort((a, b) => b.growth - a.growth);
    else if (sort === "ending-soon") r = [...r].sort((a, b) => a.daysToHarvest - b.daysToHarvest);
    else r = [...r].sort((a, b) => Number(b.trending) - Number(a.trending));
    return r;
  }, [cat, harvestWithin, maxTicket, q, regionFilter, riskAllow, roiMax, roiMin, sort, verifiedFarmersOnly]);

  const totals = useMemo(() => marketplaceTotals(filtered), [filtered]);

  const risksDefault =
    RISK_ALL.length === riskAllow.length && RISK_ALL.every((r) => riskAllow.includes(r));

  const advActive =
    roiMin !== 10 ||
    roiMax !== 90 ||
    maxTicket !== 75000 ||
    harvestWithin !== 800 ||
    regionFilter !== "all" ||
    !risksDefault ||
    verifiedFarmersOnly;

  const activeFilterCount =
    Number(cat !== "all") + Number(q.trim() !== "") + Number(advActive);

  const toggleRisk = (lv: RiskLevel) => {
    setRiskAllow((prev) => {
      const exists = prev.includes(lv);
      let next = exists ? prev.filter((x) => x !== lv) : [...prev, lv];
      if (next.length === 0) next = [...RISK_ALL];
      return next;
    });
  };

  const trendingStrip = trendingProduce(filtered);
  const recentStrip = recentlyFundedProduce(filtered);

  const marqueeFeedRaw = liveActivity.length > 8 ? liveActivity : LIVE_ACTIVITY;
  const marqueeFeed = marqueeFeedRaw.slice(0, 60);

  return (
    <div className="space-y-5 pb-16">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <Pill color="lime" dot>
            Live · {filtered.length} listings / {PRODUCE_DATA.length} seeded
          </Pill>
          <Pill color="ash" icon={Globe}>
            African network
          </Pill>
          <Pill color="emerald" icon={BarChart3}>
            {Math.round((totals.totalRaiseTargetUsd / 1_000_000) * 10) / 10}M USDC modeled raise
          </Pill>
        </div>
        <Btn variant="primary" icon={Plus} onClick={() => setUploadOpen(true)}>
          Upload Produce
        </Btn>
      </div>

      <ImpactHighlights />

      {/* Analytics strip */}
      <Glass className="p-4 grid sm:grid-cols-4 gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Median ROI filter</div>
          <div className="font-black text-xl text-white tabular-nums">{totals.medianRoi}%</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Verified cohort</div>
          <div className="font-black text-xl text-white tabular-nums">{totals.verifiedPct}%</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total raise window</div>
          <div className="font-black text-xl text-white truncate">
            {(totals.totalRaiseTargetUsd / 1e6).toFixed(2)}M USDC
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active filters</div>
          <div className="font-black text-xl text-white tabular-nums">{activeFilterCount}</div>
        </div>
      </Glass>

      <Glass className="p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-line flex-1 min-w-[220px]"
            style={{ background: "rgba(0,0,0,0.3)" }}
          >
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Produce, farmer, escrow ID…"
              className="bg-transparent outline-none text-sm text-white placeholder:text-slate-600 flex-1 min-w-0"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortBy)}
              className="bg-black/30 border border-line rounded-xl px-3 py-2 text-sm text-white font-bold outline-none cursor-pointer focus-ring"
            >
              <option value="trending">Trending</option>
              <option value="roi">Highest ROI</option>
              <option value="quality">Top Quality</option>
              <option value="growth">Growth Stage</option>
              <option value="ending-soon">Ending Soon</option>
            </select>
          </div>
          <Btn variant="outline" icon={SlidersHorizontal} size="sm" onClick={() => setAdvOpen((v) => !v)}>
            {advOpen ? "Hide" : "Show"} filters
          </Btn>
        </div>

        <AnimatePresence initial={false}>
          {advOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid md:grid-cols-4 gap-3 overflow-hidden pt-3 border-t border-white/10"
            >
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex flex-col gap-1">
                ROI min %
                <input
                  type="number"
                  value={roiMin}
                  min={5}
                  max={120}
                  onChange={(e) => setRoiMin(Number(e.target.value))}
                  className="bg-black/40 border border-line rounded-xl px-2 py-1.5 text-white font-semibold outline-none focus-ring"
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex flex-col gap-1">
                ROI max %
                <input
                  type="number"
                  value={roiMax}
                  min={roiMin}
                  max={220}
                  onChange={(e) => setRoiMax(Number(e.target.value))}
                  className="bg-black/40 border border-line rounded-xl px-2 py-1.5 text-white font-semibold outline-none focus-ring"
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex flex-col gap-1">
                Max ticket (USDC)
                <input
                  type="number"
                  step={250}
                  value={maxTicket}
                  min={100}
                  onChange={(e) => setMaxTicket(Number(e.target.value))}
                  className="bg-black/40 border border-line rounded-xl px-2 py-1.5 text-white font-semibold outline-none focus-ring"
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex flex-col gap-1">
                Harvest within (days)
                <input
                  type="number"
                  step={14}
                  value={harvestWithin}
                  min={7}
                  onChange={(e) => setHarvestWithin(Number(e.target.value))}
                  className="bg-black/40 border border-line rounded-xl px-2 py-1.5 text-white font-semibold outline-none focus-ring"
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex flex-col gap-1">
                Region
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="bg-black/40 border border-line rounded-xl px-2 py-1.5 text-white font-semibold outline-none focus-ring cursor-pointer"
                >
                  <option value="all">Any region</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex flex-col gap-3">
                Verified farmers only
                <button
                  type="button"
                  onClick={() => setVerifiedFarmersOnly((x) => !x)}
                  className={cn(
                    "rounded-xl px-3 py-2 border text-xs font-black tracking-wide transition focus-ring inline-flex items-center gap-2",
                    verifiedFarmersOnly
                      ? "bg-lime-500/15 border-lime-500/50 text-lime-200"
                      : "border-white/10 text-slate-400 hover:border-white/20",
                  )}
                >
                  <ShieldCheck className="w-4 h-4" /> Toggle platform ID checks
                </button>
              </label>
              <div className="md:col-span-2 flex flex-wrap gap-2 items-end pb-2">
                {RISK_ALL.map((risk) => {
                  const active = riskAllow.includes(risk);
                  return (
                    <button
                      key={risk}
                      type="button"
                      onClick={() => toggleRisk(risk)}
                      className={cn(
                        "rounded-full px-3 py-1.5 border text-[11px] font-black uppercase tracking-[0.2em]",
                        active
                          ? "bg-white/80 text-black border-white"
                          : "border-white/10 text-slate-500 hover:border-white/30 hover:text-white",
                      )}
                    >
                      {risk}
                    </button>
                  );
                })}
                <Btn
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRoiMin(10);
                    setRoiMax(90);
                    setMaxTicket(75000);
                    setHarvestWithin(800);
                    setRegionFilter("all");
                    setRiskAllow(RISK_ALL);
                    setVerifiedFarmersOnly(false);
                  }}
                >
                  Reset
                </Btn>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1 mask-fade-x">
          {CATEGORIES.map((c) => {
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all focus-ring",
                  active
                    ? "bg-lime-400 text-black border border-lime-400 shadow-[0_0_24px_-4px_rgba(132,204,22,0.5)]"
                    : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/10 hover:border-white/20",
                )}
              >
                <c.icon className="w-3.5 h-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>
      </Glass>

      <FarmerSpotlightRow />

      {/* Trending */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Pill color="amber" icon={TrendingUp}>
            Trending produce
          </Pill>
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-[0.2em]">
            Live capital rotation
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 px-1 -mx-1 snap-x mask-fade-x">
          {(trendingStrip.length ? trendingStrip : filtered.slice(0, 6)).slice(0, 8).map((p, i) => (
            <div key={p.id} className="snap-start shrink-0 w-[min(360px,calc(100vw-52px))]">
              <ProduceCard item={p} index={i} onInvest={onInvest} onVerify={onVerify} />
            </div>
          ))}
        </div>
      </div>

      {/* Recently funded */}
      <div className="space-y-3">
        <Pill color="emerald">Recently funded & hot closes</Pill>
        <div className="flex gap-4 overflow-x-auto pb-2 px-1 -mx-1 snap-x mask-fade-x">
          {(recentStrip.length ? recentStrip : filtered).slice(0, 10).map((p, i) => (
            <div key={`rf-${p.id}`} className="snap-start shrink-0 w-[min(340px,calc(100vw-52px))]">
              <ProduceCard item={p} index={i} onInvest={onInvest} onVerify={onVerify} />
            </div>
          ))}
        </div>
      </div>

      {/* Live investor feed */}
      <Glass className="p-3">
        <div className="flex items-center gap-3 text-xs">
          <Pill color="sky" dot>
            Live investor feed
          </Pill>
          <div className="flex-1 overflow-hidden whitespace-nowrap mask-fade-x">
            <motion.div
              className="flex items-center gap-6 text-slate-400 will-change-transform"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 54, repeat: Infinity, ease: "linear" }}
            >
              {[...marqueeFeed, ...marqueeFeed].map((a, i) => (
                <span key={`${a.id}-${i}`} className="font-mono text-[11px]">
                  ▸ {a.text}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </Glass>

      <AnimatePresence mode="popLayout">
        {!showGrid ? (
          <motion.div key="sk" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MarketplaceSkeleton />
          </motion.div>
        ) : (
          <motion.div
            layout
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filtered.map((p, i) => (
              <ProduceCard
                key={p.id}
                item={p}
                index={i}
                onInvest={onInvest}
                onVerify={onVerify}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {showGrid && filtered.length === 0 && (
        <Glass className="p-12 text-center">
          <Sprout className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <div className="font-black text-white">No matches.</div>
          <div className="text-sm text-slate-500">Loosen ROI, ticket caps, or clear category filters.</div>
        </Glass>
      )}
    </div>
  );
}

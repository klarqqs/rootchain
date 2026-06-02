import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { RefreshCw, Search, ShieldCheck, Sprout, Users } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { AuthSetupRequired } from "@/components/auth/auth-setup-required";
import { ProjectCard, VerifiedFarmersStrip } from "@/features/marketplace/project-card";
import { MarketplaceSkeletonGrid } from "@/features/marketplace/marketplace-skeleton";
import { ProjectDetailPanel } from "@/features/marketplace/project-detail-panel";
import { useMarketplaceListings } from "@/hooks/use-marketplace-listings";
import { dbAvailable } from "@/database/client";
import type { MarketplaceListing } from "@/types/marketplace";
import { formatUsd } from "@/lib/utils";

interface MarketplacePageProps {
  onInvest: (listing: MarketplaceListing) => void;
  onTxClick?: (hash: string) => void;
}

export function MarketplacePage({ onInvest, onTxClick }: MarketplacePageProps) {
  const [detailListing, setDetailListing] = useState<MarketplaceListing | null>(null);
  const {
    filtered,
    loading,
    error,
    reload,
    query,
    setQuery,
    cropType,
    setCropType,
    cropTypes,
    duration,
    setDuration,
    sort,
    setSort,
    riskLevel,
    setRiskLevel,
    page,
    setPage,
    pagination,
    stats,
    verifiedFarmers,
  } = useMarketplaceListings();

  if (!dbAvailable) {
    return (
      <div className="pb-16">
        <AuthSetupRequired title="Marketplace requires a backend" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-16">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <Pill color="lime" dot icon={ShieldCheck}>
            Verified farmers · active projects only
          </Pill>
          <Pill color="ash">{loading ? "Loading…" : `${stats.projectCount} live listings`}</Pill>
          {stats.investorCount > 0 && (
            <Pill color="purple" icon={Users}>
              {stats.investorCount} investor{stats.investorCount === 1 ? "" : "s"}
            </Pill>
          )}
        </div>
        <Btn variant="outline" icon={RefreshCw} size="sm" onClick={() => void reload()} disabled={loading}>
          Refresh
        </Btn>
      </div>

      <Glass className="p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Verified farmers</div>
          <div className="font-black text-xl text-white tabular-nums">{stats.farmerCount}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active projects</div>
          <div className="font-black text-xl text-white tabular-nums">{stats.projectCount}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Capital raised</div>
          <div className="font-black text-xl text-white tabular-nums">{formatUsd(stats.totalRaised)}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Funding target</div>
          <div className="font-black text-xl text-white tabular-nums">{formatUsd(stats.totalTarget)}</div>
        </div>
      </Glass>

      <Glass className="p-4 space-y-4">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-line"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, farmers, crops…"
            className="bg-transparent outline-none text-sm text-white placeholder:text-slate-600 flex-1 min-w-0"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex flex-col gap-1">
            Crop type
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="bg-black/40 border border-line rounded-xl px-3 py-2 text-sm text-white font-semibold outline-none cursor-pointer focus-ring"
            >
              <option value="all">All crops</option>
              {cropTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex flex-col gap-1">
            Duration
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as typeof duration)}
              className="bg-black/40 border border-line rounded-xl px-3 py-2 text-sm text-white font-semibold outline-none cursor-pointer focus-ring"
            >
              <option value="all">Any duration</option>
              <option value="short">Short (≤ 90 days)</option>
              <option value="medium">Medium (91–180 days)</option>
              <option value="long">Long (&gt; 180 days)</option>
            </select>
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex flex-col gap-1">
            Risk
            <select
              value={riskLevel}
              onChange={(e) => {
                setRiskLevel(e.target.value);
                setPage(1);
              }}
              className="bg-black/40 border border-line rounded-xl px-3 py-2 text-sm text-white font-semibold outline-none cursor-pointer focus-ring"
            >
              <option value="all">All risk levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex flex-col gap-1">
            Sort by
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as typeof sort);
                setPage(1);
              }}
              className="bg-black/40 border border-line rounded-xl px-3 py-2 text-sm text-white font-semibold outline-none cursor-pointer focus-ring"
            >
              <option value="newest">Newest</option>
              <option value="funding">Funding progress</option>
              <option value="roi">Expected ROI</option>
              <option value="ending">Ending soon</option>
            </select>
          </label>
        </div>
      </Glass>

      {error && (
        <Glass className="p-4 border border-rose-500/30 bg-rose-500/[0.06] text-sm text-rose-100">
          Could not load marketplace data: {error}
        </Glass>
      )}

      <VerifiedFarmersStrip farmers={verifiedFarmers} />

      {loading ? (
        <MarketplaceSkeletonGrid />
      ) : filtered.length === 0 ? (
        <Glass className="p-12 text-center">
          <Sprout className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <div className="font-black text-white">No active investment opportunities</div>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            The marketplace only lists verified farmers with <strong className="text-slate-400">active</strong>{" "}
            projects. Publish real rows in Supabase{" "}
            <code className="text-lime-200">farmers</code> and <code className="text-lime-200">projects</code>, then
            refresh.
          </p>
        </Glass>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((listing, i) => (
              <div key={listing.id} onClick={() => setDetailListing(listing)} className="cursor-pointer">
                <ProjectCard listing={listing} index={i} onInvest={(l) => { onInvest(l); }} />
              </div>
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Btn
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Btn>
              <span className="text-xs text-slate-500 tabular-nums">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Btn
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Btn>
            </div>
          )}
        </>
      )}
      <AnimatePresence>
        {detailListing && (
          <ProjectDetailPanel
            listing={detailListing}
            onClose={() => setDetailListing(null)}
            onInvest={(l) => {
              setDetailListing(null);
              onInvest(l);
            }}
            onTxClick={onTxClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

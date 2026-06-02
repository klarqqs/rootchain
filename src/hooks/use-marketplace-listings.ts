import { useCallback, useEffect, useMemo, useState } from "react";
import { listMarketplaceListings } from "@/database/services/marketplace.service";
import type {
  MarketplaceDurationFilter,
  MarketplaceListing,
  MarketplaceSort,
} from "@/types/marketplace";
import { isApiBackendConfigured } from "@/lib/api/config";

function matchesDuration(listing: MarketplaceListing, duration: MarketplaceDurationFilter): boolean {
  if (duration === "all") return true;
  const days = listing.durationDays;
  if (duration === "short") return days <= 90;
  if (duration === "medium") return days > 90 && days <= 180;
  return days > 180;
}

export function useMarketplaceListings() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
  });
  const [globalStats, setGlobalStats] = useState({
    projectCount: 0,
    totalTarget: 0,
    totalRaised: 0,
  });

  const [query, setQuery] = useState("");
  const [cropType, setCropType] = useState<string>("all");
  const [riskLevel, setRiskLevel] = useState<string>("all");
  const [duration, setDuration] = useState<MarketplaceDurationFilter>("all");
  const [sort, setSort] = useState<MarketplaceSort>("newest");
  const [page, setPage] = useState(1);

  const apiMode = isApiBackendConfigured();

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listMarketplaceListings({
      search: apiMode ? query.trim() : undefined,
      cropType: apiMode ? cropType : undefined,
      riskLevel: apiMode && riskLevel !== "all" ? riskLevel : undefined,
      sort: apiMode ? sort : undefined,
      page: apiMode ? page : undefined,
      pageSize: apiMode ? 12 : undefined,
    });
    setListings(res.listings);
    setError(res.error);
    setPagination(res.pagination);
    setGlobalStats(res.stats);
    setLoading(false);
  }, [apiMode, query, cropType, riskLevel, sort, page]);

  const filtered = useMemo(() => {
    if (apiMode) return listings;
    const q = query.trim().toLowerCase();
    let rows = listings.filter((listing) => matchesDuration(listing, duration));
    if (cropType !== "all") rows = rows.filter((l) => l.cropType === cropType);
    if (riskLevel !== "all") rows = rows.filter((l) => l.riskLevel === riskLevel);
    if (q) {
      rows = rows.filter(
        (listing) =>
          listing.title.toLowerCase().includes(q) ||
          listing.description.toLowerCase().includes(q) ||
          listing.cropType.toLowerCase().includes(q) ||
          listing.farmer.name.toLowerCase().includes(q) ||
          (listing.location ?? listing.farmer.location).toLowerCase().includes(q),
      );
    }
    const sorted = [...rows];
    if (sort === "funding") sorted.sort((a, b) => b.fundingProgressPct - a.fundingProgressPct);
    else if (sort === "roi") sorted.sort((a, b) => (b.expectedRoiPct ?? 0) - (a.expectedRoiPct ?? 0));
    else if (sort === "ending") sorted.sort((a, b) => a.endDate.localeCompare(b.endDate));
    return sorted;
  }, [listings, query, cropType, riskLevel, duration, sort, apiMode]);

  const stats = useMemo(() => {
    const source = apiMode ? filtered : filtered;
    const totalTarget = source.reduce((sum, l) => sum + l.targetAmount, 0);
    const totalRaised = source.reduce((sum, l) => sum + l.raisedAmount, 0);
    const farmers = new Set(source.map((l) => l.farmer.id));
    const investors = source.reduce((sum, l) => sum + l.investorCount, 0);
    return {
      projectCount: apiMode ? globalStats.projectCount : source.length,
      farmerCount: farmers.size,
      investorCount: investors,
      totalTarget: apiMode ? globalStats.totalTarget : totalTarget,
      totalRaised: apiMode ? globalStats.totalRaised : totalRaised,
    };
  }, [filtered, apiMode, globalStats]);

  const verifiedFarmers = useMemo(() => {
    const byId = new Map<string, MarketplaceListing["farmer"] & { projectCount: number }>();
    for (const listing of listings) {
      const existing = byId.get(listing.farmer.id);
      if (existing) existing.projectCount += 1;
      else byId.set(listing.farmer.id, { ...listing.farmer, projectCount: 1 });
    }
    return [...byId.values()].sort((a, b) => b.projectCount - a.projectCount);
  }, [listings]);

  const cropTypes = useMemo(() => {
    const types = new Set(listings.map((l) => l.cropType).filter(Boolean));
    return [...types].sort((a, b) => a.localeCompare(b));
  }, [listings]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    listings,
    filtered,
    loading,
    error,
    reload: load,
    query,
    setQuery,
    cropType,
    setCropType,
    cropTypes,
    riskLevel,
    setRiskLevel,
    duration,
    setDuration,
    sort,
    setSort,
    page,
    setPage,
    pagination,
    stats,
    verifiedFarmers,
    apiMode,
  };
}

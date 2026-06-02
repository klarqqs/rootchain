import { apiRequest } from "@/lib/api/http-client";
import type {
  MarketplaceListParams,
  MarketplaceListResult,
  MarketplaceListing,
} from "@/types/marketplace";

interface ApiListing {
  id: string;
  title: string;
  description: string;
  cropType: string;
  location?: string;
  targetAmount: number;
  raisedAmount: number;
  expectedRoiPct?: number;
  riskLevel?: "low" | "medium" | "high";
  aiScore?: number | null;
  harvestTimeline?: string | null;
  startDate: string;
  endDate: string;
  status: string;
  fundingProgressPct: number;
  durationDays: number;
  coverImageUrl?: string | null;
  coverVideoUrl?: string | null;
  farmer: {
    id: string;
    name: string;
    location: string;
    verification_status: string;
  };
  investorCount: number;
}

function mapListing(row: ApiListing): MarketplaceListing {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    cropType: row.cropType,
    location: row.location,
    targetAmount: row.targetAmount,
    raisedAmount: row.raisedAmount,
    expectedRoiPct: row.expectedRoiPct,
    riskLevel: row.riskLevel,
    aiScore: row.aiScore,
    harvestTimeline: row.harvestTimeline,
    startDate: row.startDate,
    endDate: row.endDate,
    status: "active",
    fundingProgressPct: row.fundingProgressPct,
    durationDays: row.durationDays,
    coverImageUrl: row.coverImageUrl,
    coverVideoUrl: row.coverVideoUrl,
    farmer: {
      id: row.farmer.id,
      name: row.farmer.name,
      location: row.farmer.location,
      verification_status: "verified",
    },
    investorCount: row.investorCount,
  };
}

export async function fetchMarketplaceListingsFromApi(
  params: MarketplaceListParams = {},
): Promise<MarketplaceListResult> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.cropType && params.cropType !== "all") qs.set("cropType", params.cropType);
  if (params.riskLevel && params.riskLevel !== "all") qs.set("riskLevel", params.riskLevel.toUpperCase());
  if (params.sort) qs.set("sort", params.sort);
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));

  const path = `/marketplace/listings${qs.toString() ? `?${qs}` : ""}`;
  const data = await apiRequest<{
    listings: ApiListing[];
    pagination: MarketplaceListResult["pagination"];
    stats: MarketplaceListResult["stats"];
  }>(path, {}, { auth: false });

  return {
    listings: data.listings.map(mapListing),
    pagination: data.pagination,
    stats: data.stats,
    error: null,
  };
}

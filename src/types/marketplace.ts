import type { FarmerRow, ProjectRow } from "@/database/types";

export type MarketplaceProjectStatus = ProjectRow["status"];

export type MarketplaceRiskLevel = "low" | "medium" | "high";

export type MarketplaceSort = "newest" | "funding" | "roi" | "ending";

/** Project joined with verified farmer — marketplace read model. */
export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  cropType: string;
  location?: string;
  targetAmount: number;
  raisedAmount: number;
  expectedRoiPct?: number;
  riskLevel?: MarketplaceRiskLevel;
  aiScore?: number | null;
  harvestTimeline?: string | null;
  startDate: string;
  endDate: string;
  status: MarketplaceProjectStatus;
  farmer: Pick<FarmerRow, "id" | "name" | "location" | "verification_status">;
  fundingProgressPct: number;
  durationDays: number;
  investorCount: number;
  coverImageUrl?: string | null;
  coverVideoUrl?: string | null;
}

export type MarketplaceDurationFilter = "all" | "short" | "medium" | "long";

export interface MarketplaceListParams {
  search?: string;
  cropType?: string;
  riskLevel?: string;
  sort?: MarketplaceSort;
  page?: number;
  pageSize?: number;
}

export interface MarketplaceListResult {
  listings: MarketplaceListing[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  stats: {
    projectCount: number;
    totalTarget: number;
    totalRaised: number;
  };
  error: string | null;
}

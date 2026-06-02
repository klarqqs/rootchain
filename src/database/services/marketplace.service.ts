import { supabase } from "@/database/client";
import { isApiBackendConfigured } from "@/lib/api/config";
import { fetchMarketplaceListingsFromApi } from "@/database/services/marketplace-api.service";
import type { MarketplaceListParams, MarketplaceListResult, MarketplaceListing } from "@/types/marketplace";

type ProjectFarmerRow = {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  start_date: string;
  end_date: string;
  status: MarketplaceListing["status"];
  crop_type: string;
  farmers: {
    id: string;
    name: string;
    location: string;
    verification_status: "pending" | "verified";
  };
};

type InvestorStatsRow = {
  project_id: string;
  investor_count: number;
};

/** Skip obvious seed / QA rows that should never appear in production marketplace. */
const PLACEHOLDER_PATTERN = /\b(test|demo|placeholder|sample|mock|fake|lorem)\b/i;

function isProductionListing(row: ProjectFarmerRow): boolean {
  const title = row.title.trim();
  const farmerName = row.farmers.name.trim();
  if (title.length < 3 || farmerName.length < 2) return false;
  if (PLACEHOLDER_PATTERN.test(title) || PLACEHOLDER_PATTERN.test(farmerName)) return false;
  if (row.farmers.verification_status !== "verified") return false;
  if (row.status !== "active") return false;
  return true;
}

function durationDays(startDate: string, endDate: string): number {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
}

function mapListing(row: ProjectFarmerRow, investorCount: number): MarketplaceListing {
  const targetAmount = Number(row.target_amount);
  const raisedAmount = Number(row.raised_amount);
  const fundingProgressPct =
    targetAmount > 0 ? Math.min(100, Math.round((raisedAmount / targetAmount) * 100)) : 0;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    cropType: row.crop_type,
    targetAmount,
    raisedAmount,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    farmer: {
      id: row.farmers.id,
      name: row.farmers.name,
      location: row.farmers.location,
      verification_status: row.farmers.verification_status,
    },
    fundingProgressPct,
    durationDays: durationDays(row.start_date, row.end_date),
    investorCount,
  };
}

async function fetchInvestorCounts(projectIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (!supabase || projectIds.length === 0) return counts;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db
    .from("marketplace_project_stats")
    .select("project_id, investor_count")
    .in("project_id", projectIds);

  if (error || !data) return counts;

  for (const row of data as InvestorStatsRow[]) {
    counts.set(row.project_id, Number(row.investor_count) || 0);
  }
  return counts;
}

/** Verified farmers + active projects only — no mock or placeholder listings. */
export async function listMarketplaceListings(
  params: MarketplaceListParams = {},
): Promise<MarketplaceListResult> {
  if (isApiBackendConfigured()) {
    try {
      return await fetchMarketplaceListingsFromApi(params);
    } catch (e) {
      const message = e instanceof Error ? e.message : "API request failed";
      return {
        listings: [],
        pagination: { page: 1, pageSize: 12, total: 0, totalPages: 0 },
        stats: { projectCount: 0, totalTarget: 0, totalRaised: 0 },
        error: message,
      };
    }
  }

  if (!supabase) {
    return {
      listings: [],
      pagination: { page: 1, pageSize: 12, total: 0, totalPages: 0 },
      stats: { projectCount: 0, totalTarget: 0, totalRaised: 0 },
      error: "Backend is not configured.",
    };
  }

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      id,
      title,
      description,
      target_amount,
      raised_amount,
      start_date,
      end_date,
      status,
      crop_type,
      farmers!inner (
        id,
        name,
        location,
        verification_status
      )
    `.trim(),
    )
    .eq("status", "active")
    .eq("farmers.verification_status", "verified")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      listings: [],
      pagination: { page: 1, pageSize: 12, total: 0, totalPages: 0 },
      stats: { projectCount: 0, totalTarget: 0, totalRaised: 0 },
      error: error.message,
    };
  }

  const rows = ((data ?? []) as ProjectFarmerRow[]).filter(isProductionListing);
  const investorCounts = await fetchInvestorCounts(rows.map((r) => r.id));
  const listings = rows.map((row) => mapListing(row, investorCounts.get(row.id) ?? 0));

  return {
    listings,
    pagination: { page: 1, pageSize: listings.length, total: listings.length, totalPages: 1 },
    stats: {
      projectCount: listings.length,
      totalTarget: listings.reduce((s, l) => s + l.targetAmount, 0),
      totalRaised: listings.reduce((s, l) => s + l.raisedAmount, 0),
    },
    error: null,
  };
}

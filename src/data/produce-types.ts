import type { LucideIcon } from "lucide-react";

export type RiskLevel = "Low" | "Moderate" | "Higher";

export type ProduceRegion = "West Africa" | "East Africa" | "Southern Africa" | "Central Africa";

/**
 * Marketplace categories — aligned with upload + filters.
 * Live API can map coarser exchanges to these slugs.
 */
export type ProduceCategory =
  | "maize"
  | "rice"
  | "cassava"
  | "cocoa"
  | "yam"
  | "tomato"
  | "onion"
  | "pepper"
  | "palm_oil"
  | "wheat"
  | "soybeans"
  | "coffee"
  | "groundnut"
  | "millet"
  | "sorghum"
  | "vegetables"
  | "fruits"
  | "fish"
  | "poultry"
  | "cattle"
  | "goat"
  | "swine"
  | "dairy";

export interface ProduceItem {
  id: string;
  name: string;
  category: ProduceCategory;
  farmer: string;
  farmerHandle: string;
  farm: string;
  location: string;
  region: ProduceRegion;
  quality: number;
  quantity: string;
  harvestDate: string;
  daysToHarvest: number;
  growth: number;
  sharesAvail: number;
  sharesTotal: number;
  roi: number;
  risk: RiskLevel;
  funded: number;
  target: number;
  color: string;
  icon: LucideIcon;
  verified: boolean;
  trending: boolean;
  investorCount: number;
  hash: string;
  /** Premium hero photo — external URLs today; CDN / IPFS later. */
  imageUrl: string;
  /** Human spot / benchmark label, e.g. "$312 / MT · Lagos hub". */
  marketSpotLabel: string;
  /** Baseline mock “spot momentum” percent; UI adds light jitter. */
  momentumBaselinePct: number;
  /** Modeled gross harvest value at exit (USDC narrative). */
  estimatedHarvestUsd: number;
  /** Minimum ticket if different from derived unit price. */
  investmentMinimumUsd?: number;
  /** Used for “Recently funded” rails. */
  recentlyFunded?: boolean;
}

export interface Category {
  id: ProduceCategory | "all";
  label: string;
  icon: LucideIcon;
}

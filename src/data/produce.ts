import {
  Bean,
  Beef,
  Box,
  Carrot,
  Cherry,
  Coffee,
  Droplets,
  Egg,
  Fish,
  Flame,
  Ham,
  Layers,
  Leaf,
  Milk,
  Rabbit,
  Sprout,
  Wheat,
} from "lucide-react";

export type { Category, ProduceCategory, ProduceItem, ProduceRegion, RiskLevel } from "./produce-types";
import type { Category, ProduceCategory, ProduceItem } from "./produce-types";
import { PRODUCE_DATA } from "./produce-catalog";

export { PRODUCE_DATA };

/** Upload form / API ingestion — exhaustive category slugs. */
export const UPLOAD_CATEGORY_OPTIONS: ProduceCategory[] = [
  "maize",
  "rice",
  "cassava",
  "cocoa",
  "yam",
  "tomato",
  "onion",
  "pepper",
  "palm_oil",
  "wheat",
  "soybeans",
  "coffee",
  "groundnut",
  "millet",
  "sorghum",
  "vegetables",
  "fruits",
  "fish",
  "poultry",
  "cattle",
  "goat",
  "swine",
  "dairy",
];

export function trendingProduce(items: ProduceItem[] = PRODUCE_DATA): ProduceItem[] {
  return items.filter((p) => p.trending);
}

/** Recently crossed tranches OR explicit pilot flag */
export function recentlyFundedProduce(items: ProduceItem[] = PRODUCE_DATA): ProduceItem[] {
  return items.filter((p) => p.recentlyFunded === true || p.funded / p.target >= 0.92).slice(0, 12);
}

export interface MarketplaceTotals {
  listings: number;
  totalRaiseTargetUsd: number;
  medianRoi: number;
  verifiedPct: number;
}

export function marketplaceTotals(items: ProduceItem[] = PRODUCE_DATA): MarketplaceTotals {
  if (!items.length) {
    return { listings: 0, totalRaiseTargetUsd: 0, medianRoi: 0, verifiedPct: 0 };
  }
  const roisSorted = [...items].map((p) => p.roi).sort((a, b) => a - b);
  const mid = Math.floor(roisSorted.length / 2);
  const medianRoi =
    roisSorted.length % 2 === 0 ? (roisSorted[mid - 1] + roisSorted[mid]) / 2 : roisSorted[mid];
  const verifiedPct = Math.round((items.filter((p) => p.verified).length / items.length) * 100);
  return {
    listings: items.length,
    totalRaiseTargetUsd: items.reduce((s, p) => s + p.target, 0),
    medianRoi: Math.round(medianRoi * 10) / 10,
    verifiedPct,
  };
}

/** Primary marketplace taxonomy — chips stay horizontally scrollable. */
export const CATEGORIES: Category[] = [
  { id: "all", label: "All Produce", icon: Layers },
  { id: "maize", label: "Maize", icon: Wheat },
  { id: "rice", label: "Rice", icon: Wheat },
  { id: "wheat", label: "Wheat", icon: Wheat },
  { id: "millet", label: "Millet", icon: Wheat },
  { id: "sorghum", label: "Sorghum", icon: Wheat },
  { id: "cassava", label: "Cassava", icon: Sprout },
  { id: "yam", label: "Yam", icon: Sprout },
  { id: "cocoa", label: "Cocoa", icon: Leaf },
  { id: "coffee", label: "Coffee", icon: Coffee },
  { id: "soybeans", label: "Soybeans", icon: Bean },
  { id: "groundnut", label: "Groundnuts", icon: Bean },
  { id: "tomato", label: "Tomatoes", icon: Carrot },
  { id: "onion", label: "Onions", icon: Box },
  { id: "pepper", label: "Peppers", icon: Flame },
  { id: "palm_oil", label: "Palm Oil", icon: Droplets },
  { id: "vegetables", label: "Vegetables", icon: Sprout },
  { id: "fruits", label: "Fruits", icon: Cherry },
  { id: "fish", label: "Aquaculture", icon: Fish },
  { id: "poultry", label: "Poultry", icon: Egg },
  { id: "cattle", label: "Cattle", icon: Beef },
  { id: "goat", label: "Goats", icon: Rabbit },
  { id: "swine", label: "Swine", icon: Ham },
  { id: "dairy", label: "Dairy", icon: Milk },
];

import { PRODUCE_DATA } from "@/data/produce";
import { SEED_FARMERS } from "@/database/seed-farmers";
import { computePlatformTransparency } from "@/transparency/platform-metrics";

export interface PlatformImpactSnapshot {
  transparency: ReturnType<typeof computePlatformTransparency>;
  farmerPool: number;
  produceListings: number;
  modeledCarbonTonsAvoided: number;
  modeledSmallholderFamilies: number;
}

export function computePlatformImpact(): PlatformImpactSnapshot {
  const transparency = computePlatformTransparency();
  const modeledSmallholderFamilies = Math.round(SEED_FARMERS.length * 58 + transparency.liveListings * 12);
  const modeledCarbonTonsAvoided =
    Math.round((transparency.totalFundedUsd / 1_000_000) * 840 * 100) / 100;

  return {
    transparency,
    farmerPool: SEED_FARMERS.length,
    produceListings: PRODUCE_DATA.length,
    modeledCarbonTonsAvoided,
    modeledSmallholderFamilies,
  };
}

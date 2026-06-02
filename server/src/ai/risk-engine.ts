/**
 * AI Risk Engine — structured mock scoring ready for ML model swap.
 * Replace `computeRiskAssessment` internals with external inference service.
 */

import type { FarmerVerificationStatus, RiskLevel } from "@prisma/client";

export interface RiskEngineInput {
  projectId: string;
  title: string;
  cropType: string;
  location: string;
  targetAmount: number;
  expectedRoiPct: number;
  riskLevel: RiskLevel;
  farmerVerificationStatus: FarmerVerificationStatus;
  farmerDisplayName: string;
  raisedAmount: number;
  investorCount: number;
  projectAgeDays: number;
  fundingVelocityPct: number;
}

export interface RiskFactor {
  id: string;
  label: string;
  score: number;
  weight: number;
  narrative: string;
}

export interface RiskAssessment {
  modelVersion: string;
  riskScore: number;
  trustScore: number;
  predictedRoiPct: number;
  riskBand: "low" | "medium" | "high";
  factors: RiskFactor[];
  weatherRisk: number;
  locationRisk: number;
  farmerReliability: number;
  fundingBehavior: number;
  generatedAt: string;
}

const CROP_BASELINE: Record<string, number> = {
  maize: 72,
  rice: 68,
  cocoa: 58,
  coffee: 55,
  cassava: 74,
  sorghum: 70,
  other: 65,
};

const REGION_RISK: Record<string, number> = {
  nigeria: 62,
  ghana: 70,
  kenya: 75,
  "south africa": 78,
  ethiopia: 60,
};

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

function inferRegion(location: string): string {
  const l = location.toLowerCase();
  for (const key of Object.keys(REGION_RISK)) {
    if (l.includes(key)) return key;
  }
  return "default";
}

function weatherProxyForCrop(crop: string, region: string): number {
  const base = CROP_BASELINE[crop.toLowerCase()] ?? 65;
  const regionAdj = REGION_RISK[region] ?? 68;
  const seasonal = Math.sin(Date.now() / 86_400_000 / 30) * 4;
  return clamp((base + regionAdj) / 2 + seasonal);
}

export function computeRiskAssessment(input: RiskEngineInput): RiskAssessment {
  const region = inferRegion(input.location);
  const cropBase = CROP_BASELINE[input.cropType.toLowerCase()] ?? 65;

  const locationRisk = clamp(100 - (REGION_RISK[region] ?? 68));
  const weatherRisk = clamp(100 - weatherProxyForCrop(input.cropType, region));

  const farmerReliability =
    input.farmerVerificationStatus === "VERIFIED"
      ? 88
      : input.farmerVerificationStatus === "SUBMITTED"
        ? 62
        : 42;

  const fundingPct =
    input.targetAmount > 0 ? (input.raisedAmount / input.targetAmount) * 100 : 0;
  const fundingBehavior = clamp(
    50 + fundingPct * 0.3 + input.investorCount * 2 - input.fundingVelocityPct * 0.1,
  );

  const declaredRisk =
    input.riskLevel === "LOW" ? 85 : input.riskLevel === "HIGH" ? 45 : 68;

  const factors: RiskFactor[] = [
    {
      id: "crop",
      label: "Crop profile",
      score: cropBase,
      weight: 0.2,
      narrative: `${input.cropType} baseline yield assumptions for institutional underwriting.`,
    },
    {
      id: "location",
      label: "Geographic risk",
      score: 100 - locationRisk,
      weight: 0.18,
      narrative: `Regional exposure index for ${input.location || region}.`,
    },
    {
      id: "weather",
      label: "Weather stress",
      score: 100 - weatherRisk,
      weight: 0.15,
      narrative: "Seasonal rainfall and temperature variance proxy (OpenWeather API ready).",
    },
    {
      id: "farmer",
      label: "Farmer reliability",
      score: farmerReliability,
      weight: 0.22,
      narrative: `Verification: ${input.farmerVerificationStatus.toLowerCase()}.`,
    },
    {
      id: "funding",
      label: "Funding behavior",
      score: fundingBehavior,
      weight: 0.15,
      narrative: `${input.investorCount} investors · ${fundingPct.toFixed(0)}% funded.`,
    },
    {
      id: "declared",
      label: "Declared risk tier",
      score: declaredRisk,
      weight: 0.1,
      narrative: `Farmer-declared band: ${input.riskLevel.toLowerCase()}.`,
    },
  ];

  const riskScore = clamp(
    factors.reduce((s, f) => s + f.score * f.weight, 0),
  );

  const trustScore = clamp(
    farmerReliability * 0.45 + fundingBehavior * 0.25 + (100 - locationRisk) * 0.15 + cropBase * 0.15,
  );

  const predictedRoiPct = clamp(
    input.expectedRoiPct * 0.7 +
      (riskScore / 100) * 8 +
      (trustScore / 100) * 6 -
      locationRisk * 0.05,
    4,
    45,
  );

  const riskBand: RiskAssessment["riskBand"] =
    riskScore >= 75 ? "low" : riskScore >= 55 ? "medium" : "high";

  return {
    modelVersion: "rootchain-heuristic-v1",
    riskScore: Math.round(riskScore * 10) / 10,
    trustScore: Math.round(trustScore * 10) / 10,
    predictedRoiPct: Math.round(predictedRoiPct * 10) / 10,
    riskBand,
    factors,
    weatherRisk: Math.round(weatherRisk * 10) / 10,
    locationRisk: Math.round(locationRisk * 10) / 10,
    farmerReliability: Math.round(farmerReliability * 10) / 10,
    fundingBehavior: Math.round(fundingBehavior * 10) / 10,
    generatedAt: new Date().toISOString(),
  };
}

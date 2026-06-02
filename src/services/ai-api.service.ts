import { apiRequest } from "@/lib/api/http-client";

export interface RiskAssessment {
  modelVersion: string;
  riskScore: number;
  trustScore: number;
  predictedRoiPct: number;
  riskBand: "low" | "medium" | "high";
  factors: { id: string; label: string; score: number; weight: number; narrative: string }[];
  weatherRisk: number;
  locationRisk: number;
  farmerReliability: number;
  fundingBehavior: number;
  generatedAt: string;
}

export async function fetchProjectRisk(projectId: string): Promise<RiskAssessment> {
  const data = await apiRequest<{ assessment: RiskAssessment }>(
    `/ai/projects/${projectId}/risk`,
    {},
    { auth: false },
  );
  return data.assessment;
}

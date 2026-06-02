import { apiRequest } from "@/lib/api/http-client";
import { isApiBackendConfigured } from "@/lib/api/config";

export interface InvestorPortfolio {
  summary: {
    totalInvested: number;
    projectedReturns: number;
    activePositions: number;
    projectedRoiPct: number;
  };
  positions: {
    investmentId: string;
    projectId: string;
    title: string;
    cropType: string;
    location: string;
    amount: number;
    expectedRoiPct: number;
    projectedReturn: number;
    fundingProgressPct: number;
    status: string;
    stellarTxHash: string | null;
    investedAt: string;
  }[];
  recentActivity: {
    id: string;
    type: string;
    projectTitle: string;
    amount: number;
    status: string;
    stellarTxHash: string | null;
    timestamp: string;
  }[];
}

export interface FarmerDashboard {
  summary: {
    verificationStatus: string;
    projectCount: number;
    activeProjects: number;
    totalRaised: number;
    totalTarget: number;
    uniqueInvestors: number;
    fundingRatePct: number;
  };
  projects: {
    id: string;
    title: string;
    status: string;
    cropType: string;
    targetAmount: number;
    raisedAmount: number;
    expectedRoiPct: number;
    investorCount: number;
    coverUrl: string | null;
    lastUpdateAt: string | null;
  }[];
  milestones: {
    projectId: string;
    projectTitle: string;
    lastUpdate: string;
    updateType: string;
  }[];
  withdrawals: {
    available: number;
    pending: number;
    note: string;
  };
}

export async function fetchInvestorPortfolio(): Promise<InvestorPortfolio> {
  const data = await apiRequest<{ portfolio: InvestorPortfolio }>("/portfolio/investor");
  return data.portfolio;
}

export async function fetchFarmerDashboard(): Promise<FarmerDashboard> {
  const data = await apiRequest<{ dashboard: FarmerDashboard }>("/portfolio/farmer");
  return data.dashboard;
}

export function portfolioUsesApi(): boolean {
  return isApiBackendConfigured();
}

export type MarketplaceTransactionStatus = "pending" | "confirmed" | "failed";

export interface MarketplaceTransaction {
  id: string;
  userId: string;
  projectId: string;
  investmentId: string | null;
  amount: number;
  status: MarketplaceTransactionStatus;
  walletAddress: string | null;
  preparedXdr: string | null;
  stellarTxHash: string | null;
  createdAt: string;
  updatedAt: string;
  projectTitle?: string;
}

export interface SubmitMarketplaceInvestmentInput {
  userId: string;
  projectId: string;
  amount: number;
  walletAddress: string;
  projectTitle: string;
}

export interface SubmitMarketplaceInvestmentResult {
  investmentId: string;
  transactionId: string;
  status: MarketplaceTransactionStatus;
  preparedXdr: string | null;
}

import { apiRequest } from "@/lib/api/http-client";
import { isApiBackendConfigured } from "@/lib/api/config";
import { prepareUsdcInvestmentPayment } from "@/lib/stellar/prepare-investment-payment";
import { submitPreparedTransaction } from "@/lib/stellar/submit-prepared-tx";

export interface InvestmentRecord {
  id: string;
  projectId: string;
  amount: number;
  status: string;
  stellarTxHash: string | null;
  walletAddress: string | null;
  createdAt: string;
  projectedReturn?: number;
  project?: {
    id: string;
    title: string;
    status: string;
    cropType: string;
    expectedRoiPct: number;
    location: string;
  };
}

export interface EscrowIntent {
  network: string;
  escrow: string;
  memo: string;
  asset: string;
  amount: number;
  source: string;
}

export async function createApiInvestment(input: {
  projectId: string;
  amount: number;
  walletAddress: string;
}): Promise<{
  investmentId: string;
  escrow: EscrowIntent;
}> {
  const prepared = await prepareUsdcInvestmentPayment({
    sourcePublicKey: input.walletAddress,
    amountUsdc: input.amount,
    projectId: input.projectId,
  });

  const data = await apiRequest<{
    investment: { id: string };
    escrow: EscrowIntent;
  }>("/investments", {
    method: "POST",
    body: JSON.stringify({
      projectId: input.projectId,
      amount: input.amount,
      walletAddress: input.walletAddress,
      preparedXdr: prepared.ok ? prepared.preparedXdr : undefined,
    }),
  });

  if (prepared.ok) {
    await apiRequest(`/investments/${data.investment.id}/prepared-xdr`, {
      method: "PATCH",
      body: JSON.stringify({ preparedXdr: prepared.preparedXdr }),
    });
  }

  return { investmentId: data.investment.id, escrow: data.escrow };
}

export async function executeApiInvestment(input: {
  investmentId: string;
  projectId: string;
  amount: number;
  walletAddress: string;
}): Promise<{ ok: true; hash: string } | { ok: false; error: string }> {
  const prepared = await prepareUsdcInvestmentPayment({
    sourcePublicKey: input.walletAddress,
    amountUsdc: input.amount,
    projectId: input.projectId,
  });
  if (!prepared.ok) return { ok: false, error: prepared.error };

  const submitted = await submitPreparedTransaction(prepared.preparedXdr, input.walletAddress);
  if (!submitted.ok) return submitted;

  await apiRequest(`/investments/${input.investmentId}/confirm`, {
    method: "POST",
    body: JSON.stringify({ stellarTxHash: submitted.hash }),
  });

  return { ok: true, hash: submitted.hash };
}

export async function listApiInvestments(): Promise<InvestmentRecord[]> {
  const data = await apiRequest<{ investments: InvestmentRecord[] }>("/investments/mine");
  return data.investments;
}

export function investmentsUseApi(): boolean {
  return isApiBackendConfigured();
}

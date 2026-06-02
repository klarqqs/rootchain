import { supabase } from "@/database/client";
import { prepareUsdcInvestmentPayment } from "@/lib/stellar/prepare-investment-payment";
import type {
  MarketplaceTransaction,
  MarketplaceTransactionStatus,
  SubmitMarketplaceInvestmentInput,
  SubmitMarketplaceInvestmentResult,
} from "@/types/marketplace-transaction";

type ProjectStatusRow = { id: string; status: string; title: string };

type TxRow = {
  id: string;
  user_id: string;
  project_id: string;
  investment_id: string | null;
  amount: number;
  status: MarketplaceTransactionStatus;
  wallet_address: string | null;
  prepared_xdr: string | null;
  stellar_tx_hash: string | null;
  created_at: string;
  updated_at: string;
  projects?: { title: string } | null;
};

function mapTransaction(row: TxRow): MarketplaceTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    investmentId: row.investment_id,
    amount: Number(row.amount),
    status: row.status,
    walletAddress: row.wallet_address,
    preparedXdr: row.prepared_xdr,
    stellarTxHash: row.stellar_tx_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    projectTitle: row.projects?.title,
  };
}

export async function fetchProjectStatus(
  projectId: string,
): Promise<{ ok: true; status: string; title: string } | { ok: false; error: string }> {
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db
    .from("projects")
    .select("id, status, title")
    .eq("id", projectId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Project not found." };
  }
  const row = data as ProjectStatusRow;
  return { ok: true, status: row.status, title: row.title };
}

export async function submitMarketplaceInvestment(
  input: SubmitMarketplaceInvestmentInput,
): Promise<
  | { ok: true; value: SubmitMarketplaceInvestmentResult }
  | { ok: false; error: string }
> {
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const project = await fetchProjectStatus(input.projectId);
  if (!project.ok) return { ok: false, error: project.error };
  if (project.status !== "active") {
    return { ok: false, error: "This project is not accepting investments." };
  }

  if (input.amount <= 0) {
    return { ok: false, error: "Investment amount must be greater than zero." };
  }

  if (!input.walletAddress) {
    return { ok: false, error: "Connect a Stellar wallet before investing." };
  }

  const prepared = await prepareUsdcInvestmentPayment({
    sourcePublicKey: input.walletAddress,
    amountUsdc: input.amount,
    projectId: input.projectId,
  });

  const preparedXdr = prepared.ok ? prepared.preparedXdr : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: investment, error: investmentError } = await db
    .from("investments")
    .insert({
      user_id: input.userId,
      project_id: input.projectId,
      amount: input.amount,
      status: "pending",
      wallet_address: input.walletAddress,
      prepared_xdr: preparedXdr,
      transaction_hash: null,
    })
    .select("id")
    .single();

  if (investmentError || !investment) {
    return { ok: false, error: investmentError?.message ?? "Could not create investment." };
  }

  const { data: txRow, error: txError } = await db
    .from("marketplace_transactions")
    .insert({
      user_id: input.userId,
      project_id: input.projectId,
      investment_id: investment.id,
      amount: input.amount,
      status: "pending",
      wallet_address: input.walletAddress,
      prepared_xdr: preparedXdr,
      stellar_tx_hash: null,
    })
    .select("id")
    .single();

  if (txError || !txRow) {
    return { ok: false, error: txError?.message ?? "Could not create transaction record." };
  }

  return {
    ok: true,
    value: {
      investmentId: investment.id as string,
      transactionId: txRow.id as string,
      status: "pending",
      preparedXdr,
    },
  };
}

export async function listMarketplaceTransactions(
  userId: string,
): Promise<{ transactions: MarketplaceTransaction[]; error: string | null }> {
  if (!supabase) {
    return { transactions: [], error: "Supabase is not configured." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db
    .from("marketplace_transactions")
    .select(
      `
      id,
      user_id,
      project_id,
      investment_id,
      amount,
      status,
      wallet_address,
      prepared_xdr,
      stellar_tx_hash,
      created_at,
      updated_at,
      projects ( title )
    `.trim(),
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { transactions: [], error: error.message };
  }

  return {
    transactions: ((data ?? []) as TxRow[]).map(mapTransaction),
    error: null,
  };
}

export async function refreshMarketplaceTransaction(
  userId: string,
  transactionId: string,
): Promise<{ transaction: MarketplaceTransaction | null; error: string | null }> {
  if (!supabase) {
    return { transaction: null, error: "Supabase is not configured." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db
    .from("marketplace_transactions")
    .select(
      `
      id,
      user_id,
      project_id,
      investment_id,
      amount,
      status,
      wallet_address,
      prepared_xdr,
      stellar_tx_hash,
      created_at,
      updated_at,
      projects ( title )
    `.trim(),
    )
    .eq("user_id", userId)
    .eq("id", transactionId)
    .maybeSingle();

  if (error) {
    return { transaction: null, error: error.message };
  }

  if (!data) {
    return { transaction: null, error: "Transaction not found." };
  }

  return { transaction: mapTransaction(data as TxRow), error: null };
}

export async function refreshAllMarketplaceTransactions(
  userId: string,
): Promise<{ transactions: MarketplaceTransaction[]; error: string | null }> {
  return listMarketplaceTransactions(userId);
}

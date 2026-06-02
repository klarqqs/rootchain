/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/database/client";
import type { Investment } from "@/database/types";
import type { Investment as StoreInvestment } from "@/types/portfolio";

export async function persistInvestment(
  stellarAddress: string,
  position: StoreInvestment,
  txHash: string,
  xlmAmount?: number,
): Promise<void> {
  if (!supabase) return;
  const db = supabase as any;

  const { error } = await db.from("ledger_investments").upsert(
    {
      stellar_address: stellarAddress,
      stellar_tx_hash: txHash,
      produce_id: position.produceId,
      produce_name: position.produceName,
      amount_usdc: position.amount,
      amount_xlm: xlmAmount ?? null,
      shares: position.shares,
      expected_roi: position.expectedRoi,
      risk_level: position.risk,
      status: position.status,
      growth: position.growth,
    },
    { onConflict: "stellar_tx_hash" },
  );
  if (error) console.warn("[DB] persistInvestment:", error.message);
}

export async function getInvestments(stellarAddress: string): Promise<Investment[]> {
  if (!supabase) return [];
  const db = supabase as any;
  const { data } = await db
    .from("ledger_investments")
    .select("*")
    .eq("stellar_address", stellarAddress)
    .order("opened_at", { ascending: false });
  return (data as Investment[]) ?? [];
}

export async function closeInvestment(txHash: string, realizedRoi: number): Promise<void> {
  if (!supabase) return;
  const db = supabase as any;
  await db
    .from("ledger_investments")
    .update({ status: "closed", realized_roi: realizedRoi, closed_at: new Date().toISOString() })
    .eq("stellar_tx_hash", txHash);
}

export async function persistTxMetadata(
  stellarAddress: string,
  txHash: string,
  kind: string,
  amountUsdc: number | null,
  produceId?: string,
  memo?: string,
): Promise<void> {
  if (!supabase) return;
  const db = supabase as any;
  const { error } = await db.from("transaction_metadata").upsert(
    {
      stellar_address: stellarAddress,
      stellar_tx_hash: txHash,
      kind,
      amount_usdc: amountUsdc,
      produce_id: produceId ?? null,
      memo: memo ?? null,
    },
    { onConflict: "stellar_tx_hash" },
  );
  if (error) console.warn("[DB] persistTxMetadata:", error.message);
}

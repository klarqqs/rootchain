import { supabase } from "@/database/client";

/** Persist linked Stellar wallet on the canonical `profiles` row. */
export async function updateProfileWalletAddress(
  userId: string,
  walletAddress: string | null,
): Promise<void> {
  if (!supabase) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { error } = await db
    .from("profiles")
    .update({
      wallet_address: walletAddress,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.warn("[DB] updateProfileWalletAddress:", error.message);
  }
}

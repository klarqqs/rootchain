/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/database/client";
import type { UserRow } from "@/database/types";

export async function upsertUser(
  stellarAddress: string,
  displayName?: string,
): Promise<UserRow | null> {
  if (!supabase) return null;
  const db = supabase as any;

  const { data, error } = await db
    .from("users")
    .upsert(
      { stellar_address: stellarAddress, display_name: displayName ?? null },
      { onConflict: "stellar_address" },
    )
    .select()
    .single();

  if (error) {
    console.warn("[DB] upsertUser:", error.message);
    return null;
  }
  return data as UserRow;
}

export async function getUser(stellarAddress: string): Promise<UserRow | null> {
  if (!supabase) return null;
  const db = supabase as any;
  const { data } = await db
    .from("users")
    .select("*")
    .eq("stellar_address", stellarAddress)
    .single();
  return (data as UserRow) ?? null;
}

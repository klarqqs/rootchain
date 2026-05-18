/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/database/client";
import type { FarmerProfile } from "@/database/types";
import { SEED_FARMERS } from "@/database/seed-farmers";

export async function listFarmers(limit = 20): Promise<FarmerProfile[]> {
  if (!supabase) return SEED_FARMERS.slice(0, limit);
  const db = supabase as any;

  const { data, error } = await db
    .from("farmer_profiles")
    .select("*")
    .order("total_funded", { ascending: false })
    .limit(limit);

  if (error || !data || (data as any[]).length === 0) return SEED_FARMERS.slice(0, limit);
  return data as FarmerProfile[];
}

export async function getFarmerByHandle(handle: string): Promise<FarmerProfile | null> {
  if (!supabase) return SEED_FARMERS.find((f) => f.handle === handle) ?? null;
  const db = supabase as any;
  const { data } = await db
    .from("farmer_profiles")
    .select("*")
    .eq("handle", handle)
    .single();
  return (data as FarmerProfile) ?? SEED_FARMERS.find((f) => f.handle === handle) ?? null;
}

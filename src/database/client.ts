/**
 * Supabase client — persistence + Phase 8 Auth-ready session storage.
 *
 * If credentials are placeholders, client is null and services degrade gracefully.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isApiBackendConfigured } from "@/lib/api/config";
import { isSupabaseConfigured } from "@/lib/supabase-env";
import type { Database } from "./types";
import { hybridSupabaseAuthStorage } from "./auth-storage";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured()
  ? createClient<Database>(url!.trim(), key!.trim(), {
        auth: {
          storage: hybridSupabaseAuthStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      })
  : null;

/** Supabase and/or Railway API — app can run with either backend. */
export const dbAvailable = supabase !== null || isApiBackendConfigured();

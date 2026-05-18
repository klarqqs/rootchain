/**
 * Supabase client — persistence + Phase 8 Auth-ready session storage.
 *
 * If credentials are placeholders, client is null and services degrade gracefully.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { hybridSupabaseAuthStorage } from "./auth-storage";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient<Database> | null =
  url && key && !url.startsWith("https://your-") && !key.startsWith("your-")
    ? createClient<Database>(url, key, {
        auth: {
          storage: hybridSupabaseAuthStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      })
    : null;

export const dbAvailable = supabase !== null;

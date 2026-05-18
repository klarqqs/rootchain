/**
 * ROOTCHAIN authentication session facade (Supabase Auth).
 */

import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { configureAuthPersistMode } from "@/database/auth-storage";
import { supabase } from "@/database/client";
import type { AppProfileRow, Database } from "@/database/types";

function getSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error("ROOTCHAIN authentication requires a configured Supabase project.");
  }
  return supabase;
}

type ProfileUpdateRow = Database["public"]["Tables"]["app_profiles"]["Update"];

export async function fetchAppProfile(uid: string): Promise<AppProfileRow | null> {
  const sb = getSupabase();

  const { data, error } = await sb
    .from("app_profiles")
    .select("*")
    .eq("id", uid)
    .maybeSingle();

  if (error || !data) {
    if (error) console.warn("[Auth] Profile fetch:", error.message);
    return null;
  }
  return data as AppProfileRow;
}

/** Partial merge — avoids resetting columns when patching (e.g. wallet link → role). */
export async function updateAppProfile(
  userId: string,
  patch: Partial<Omit<AppProfileRow, "id" | "created_at" | "updated_at">>,
): Promise<AppProfileRow | null> {
  const sb = getSupabase();
  if (Object.keys(patch).length === 0) return fetchAppProfile(userId);
  const payload: ProfileUpdateRow = {
    ...(patch as ProfileUpdateRow),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await sb
    .from("app_profiles")
    .update(payload as never)
    .eq("id", userId)
    .select()
    .maybeSingle();

  if (error) {
    console.warn("[Auth] update profile:", error.message);
    return null;
  }
  return (data ?? null) as AppProfileRow | null;
}

export interface EmailSignUpInput {
  email: string;
  password: string;
  fullName: string;
  role: AppProfileRow["role"];
}

export async function signUpWithEmail(
  input: EmailSignUpInput,
): Promise<{ user: User | null; session: Session | null }> {
  configureAuthPersistMode(true);
  const sb = getSupabase();
  const { data, error } = await sb.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      data: {
        role: input.role,
        full_name: input.fullName.trim(),
      },
    },
  });
  if (error) throw error;
  return { user: data.user ?? null, session: data.session ?? null };
}

export async function signInWithEmail(
  email: string,
  password: string,
  rememberDevice: boolean,
): Promise<{ session: Session | null }> {
  configureAuthPersistMode(rememberDevice);
  const sb = getSupabase();
  const { data, error } = await sb.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return { session: data.session };
}

export async function signInWithGoogle(rememberDevice: boolean): Promise<void> {
  configureAuthPersistMode(rememberDevice);
  const sb = getSupabase();
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      scopes: "email profile openid",
    },
  });
  if (error) throw error;
}

export async function signOutEverywhere(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut({ scope: "global" });
}

export async function requestPasswordReset(email: string): Promise<void> {
  const sb = getSupabase();
  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}?auth=recovery` : undefined;

  const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
    redirectTo,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

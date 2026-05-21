/**
 * ROOTCHAIN authentication policy helpers (Supabase Auth).
 * When Supabase is configured, route guards default ON unless `VITE_SUPABASE_AUTH=false`.
 */

import { dbAvailable, supabase } from "@/database/client";
import type { Page } from "@/lib/nav";
import type { AppProfileRow } from "@/database/types";

function authFlag(): boolean {
  return import.meta.env.VITE_SUPABASE_AUTH !== "false";
}

/** True when SPA should require Supabase session for guarded routes/actions. */
export function isSupabaseAuthEnforced(): boolean {
  return Boolean(dbAvailable && supabase && authFlag());
}

/** Pages reachable without signing in while enforcement active. */
const ALWAYS_PUBLIC_PAGES = new Set<Page>([
  "login",
  "signup",
  "forgot-password",
  "home",
  "about",
  "help",
  "privacy",
  "terms",
  "roadmap",
  "launch",
  "ecosystem",
  "insights",
  "compliance",
  "verification",
  "farmers",
  "marketplace",
]);

export function isAlwaysPublicRoute(page: Page): boolean {
  return ALWAYS_PUBLIC_PAGES.has(page);
}

const AUTH_PROTECTED_PAGES = new Set<Page>([
  "dashboard",
  "wallet",
  "account",
  "register",
  "community",
  "admin",
]);

export function routeRequiresAuthentication(page: Page): boolean {
  if (!isSupabaseAuthEnforced()) return false;
  return AUTH_PROTECTED_PAGES.has(page);
}

export function routeAllowsFarmerIntake(profile: AppProfileRow | null): boolean {
  if (!isSupabaseAuthEnforced()) return true;
  if (!profile) return true;
  return profile.role === "farmer" || profile.role === "admin";
}

/** Dashboard / wallet surfaces — pilots allow farmers/admins/investors. */
export function canOpenPortfolioSurfaces(profile: AppProfileRow | null): boolean {
  if (!isSupabaseAuthEnforced()) return true;
  if (!profile) return true;
  return profile.role === "investor" || profile.role === "admin" || profile.role === "farmer";
}

export const AUTH_POST_LOGIN_PAGE_KEY = "rootchain-auth-return-page";

export function stashReturnPage(page: Page): void {
  try {
    sessionStorage.setItem(AUTH_POST_LOGIN_PAGE_KEY, page);
  } catch {
    /* ignore */
  }
}

export function consumeReturnPage(fallback: Page = "home"): Page {
  try {
    const raw = sessionStorage.getItem(AUTH_POST_LOGIN_PAGE_KEY);
    sessionStorage.removeItem(AUTH_POST_LOGIN_PAGE_KEY);
    const allowed = new Set<string>([
      "home",
      "about",
      "marketplace",
      "verification",
      "dashboard",
      "community",
      "wallet",
      "farmers",
      "help",
      "register",
      "privacy",
      "terms",
      "roadmap",
      "admin",
      "launch",
      "ecosystem",
      "insights",
      "compliance",
      "login",
      "signup",
      "forgot-password",
      "account",
    ]);
    if (raw && allowed.has(raw)) return raw as Page;
  } catch {
    /* ignore */
  }
  return fallback;
}

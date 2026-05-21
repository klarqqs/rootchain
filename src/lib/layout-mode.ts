import type { Page } from "@/lib/nav";

/** Surfaces that always use the in-app shell (sidebar + TopBar). */
const DASHBOARD_LAYOUT_PAGES = new Set<Page>([
  "dashboard",
  "wallet",
  "verification",
  "admin",
  "account",
  "register",
  "insights",
]);

/** Public marketing / story pages — always marketing shell. */
const MARKETING_LAYOUT_PAGES = new Set<Page>([
  "home",
  "about",
  "help",
  "privacy",
  "terms",
  "login",
  "signup",
  "forgot-password",
  "launch",
  "ecosystem",
  "roadmap",
  "compliance",
]);

/** Browse-only pages: marketing when signed out; app shell when signed in. */
const HYBRID_MARKETING_PAGES = new Set<Page>(["marketplace", "community", "farmers"]);

export type AppLayoutMode = "marketing" | "dashboard";

export function getAppLayoutMode(page: Page, signedIn: boolean): AppLayoutMode {
  /** Signed-in users get the operating shell on home (quick jump to portfolio, wallet, etc.). */
  if (page === "home" && signedIn) return "dashboard";

  if (DASHBOARD_LAYOUT_PAGES.has(page)) return "dashboard";
  if (MARKETING_LAYOUT_PAGES.has(page)) return "marketing";
  if (HYBRID_MARKETING_PAGES.has(page)) return signedIn ? "dashboard" : "marketing";
  return "dashboard";
}

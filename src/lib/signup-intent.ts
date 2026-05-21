import type { AppProfileRow } from "@/database/types";

/** Personas allowed at self-serve signup (admin is invite-only). */
export type SignupPersonaRole = Exclude<AppProfileRow["role"], "admin">;

export const SIGNUP_ROLE_STORAGE_KEY = "rootchain-signup-role";

/** Persists chosen persona for one navigation to `signup` (read in SignupPage, then cleared). */
export function stashSignupPersonaRole(role: SignupPersonaRole): void {
  try {
    sessionStorage.setItem(SIGNUP_ROLE_STORAGE_KEY, role);
  } catch {
    /* ignore */
  }
}

/** Read persona stashed for the next visit to signup (does not clear). */
export function peekSignupPersonaRole(): SignupPersonaRole | null {
  try {
    const stored = sessionStorage.getItem(SIGNUP_ROLE_STORAGE_KEY) as SignupPersonaRole | null;
    if (stored === "investor" || stored === "farmer") return stored;
  } catch {
    /* ignore */
  }
  return null;
}

/** `?intent=investor|farmer` on the marketing signup entry (does not clear). */
export function peekUrlSignupIntent(): SignupPersonaRole | null {
  if (typeof window === "undefined") return null;
  const intent = new URLSearchParams(window.location.search).get("intent");
  if (intent === "farmer" || intent === "investor") return intent;
  return null;
}

/** Clears one-shot session storage after signup page has applied it (safe in Strict Mode: no setState in effects). */
export function clearStashedSignupPersonaRole(): void {
  try {
    sessionStorage.removeItem(SIGNUP_ROLE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

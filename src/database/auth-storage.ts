/**
 * Bridges Supabase session storage across localStorage vs sessionStorage for Remember me.
 * Call `configureAuthPersistMode(true|false)` immediately before password / OAuth sign-in attempts.
 */

export type PersistMode = "local" | "session";

let persistMode: PersistMode = "local";

export function configureAuthPersistMode(useLocalPersistent: boolean): void {
  persistMode = useLocalPersistent ? "local" : "session";
}

function pickPrimary(): Storage {
  if (typeof window === "undefined") {
    throw new Error("[ROOTCHAIN] Auth storage unavailable outside browser");
  }
  return persistMode === "local" ? window.localStorage : window.sessionStorage;
}

/** Supabase-supported storage shim (hybrid fallback read for migration between modes). */
export const hybridSupabaseAuthStorage = {
  getItem(key: string): string | null {
    try {
      const prim = pickPrimary().getItem(key);
      if (prim != null) return prim;
      const alt = persistMode === "local" ? window.sessionStorage.getItem(key) : window.localStorage.getItem(key);
      return alt;
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      pickPrimary().setItem(key, value);
      if (persistMode === "local") {
        window.sessionStorage.removeItem(key);
      } else {
        window.localStorage.removeItem(key);
      }
    } catch {
      /* ignore quota / privacy mode races */
    }
  },
  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

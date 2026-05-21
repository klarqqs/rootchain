/**
 * Detects whether Vite has real Supabase project credentials (not .env.example placeholders).
 */

const PLACEHOLDER_URL_MARKERS = ["your-project.supabase.co", "https://your-", "example.supabase.co"];

const PLACEHOLDER_KEY_MARKERS = ["your-anon-public-key", "your-anon", "your_anon", "changeme"];

function trim(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getSupabaseUrl(): string | undefined {
  const url = trim(import.meta.env.VITE_SUPABASE_URL);
  return url.length ? url : undefined;
}

export function getSupabaseAnonKey(): string | undefined {
  const key = trim(import.meta.env.VITE_SUPABASE_ANON_KEY);
  return key.length ? key : undefined;
}

/** True when URL + anon key look like a live Supabase project (enables auth client). */
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return false;

  const urlLower = url.toLowerCase();
  if (!urlLower.startsWith("https://") || !urlLower.includes(".supabase.co")) return false;
  if (PLACEHOLDER_URL_MARKERS.some((m) => urlLower.includes(m))) return false;

  const keyLower = key.toLowerCase();
  if (PLACEHOLDER_KEY_MARKERS.some((m) => keyLower.includes(m))) return false;
  if (key.length < 80) return false;

  return true;
}

/** Dev-friendly hint for signup/login when client is null. */
export function supabaseSetupHint(): string {
  if (!trim(import.meta.env.VITE_SUPABASE_URL) && !trim(import.meta.env.VITE_SUPABASE_ANON_KEY)) {
    return "Copy .env.example to .env and paste your Supabase Project URL + anon key from Dashboard → Settings → API.";
  }
  if (!isSupabaseConfigured()) {
    return "Replace placeholder VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env (not the example values), then restart npm run dev.";
  }
  return "";
}

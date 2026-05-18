/**
 * Typed public environment accessors (Vite `import.meta.env.*`).
 * Secrets must never ship in VITE_* — use Supabase Edge Functions / server only.
 */

import { MAINNET_ROUTING_ENABLED } from "@/lib/stellar/effective-network";

const network = import.meta.env.VITE_STELLAR_NETWORK ?? "TESTNET";

export const publicEnv = {
  /** development | staging | production */
  appEnv: import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE,
  demoMode: import.meta.env.VITE_DEMO_MODE === "true",
  /** Demo / pitch builds — lowers assumed risk copy only; still testnet-backed. */
  showcaseMode: import.meta.env.VITE_SHOWCASE_MODE === "true",
  stellarNetwork: network,
  horizonUrl:
    import.meta.env.VITE_STELLAR_HORIZON_URL ??
    "https://horizon-testnet.stellar.org",
  adminTokenConfigured: Boolean(import.meta.env.VITE_ADMIN_TOKEN?.length),
  supabaseConfigured: Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_URL !== "https://your-project.supabase.co",
  ),
  /** HTTPS URL of an OpenAI-compatible or custom LLM **gateway** — never put provider API keys in Vite. */
  aiChatGatewayConfigured: Boolean(
    typeof import.meta.env.VITE_AI_CHAT_URL === "string" &&
      import.meta.env.VITE_AI_CHAT_URL.startsWith("http"),
  ),
  /** True when phased Stellar PUBLIC routing toggle is intentionally enabled via build operators. */
  mainnetRoutingEnabled: MAINNET_ROUTING_ENABLED,
} as const;

/** Dev-only diagnostics for misconfiguration (no secrets logged). */
export function logPublicEnvHealth(): void {
  if (import.meta.env.PROD) return;
  if (network !== "TESTNET") {
    console.warn("[ROOTCHAIN] VITE_STELLAR_NETWORK is not TESTNET — double-check before demo.");
  }
  if (!publicEnv.supabaseConfigured) {
    console.info("[ROOTCHAIN] Supabase URL not configured — persistence runs in local-only mode.");
  }
}

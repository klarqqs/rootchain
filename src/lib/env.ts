/**
 * Typed public environment accessors (Vite `import.meta.env.*`).
 */

import { isApiBackendConfigured } from "@/lib/api/config";
import { MAINNET_ROUTING_ENABLED } from "@/lib/stellar/effective-network";
import { isSupabaseConfigured } from "@/lib/supabase-env";

const network = import.meta.env.VITE_STELLAR_NETWORK ?? "PUBLIC";

export const publicEnv = {
  appEnv: import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE,
  demoMode: import.meta.env.VITE_DEMO_MODE === "true",
  showcaseMode: import.meta.env.VITE_SHOWCASE_MODE === "true",
  stellarNetwork: network,
  horizonUrl:
    import.meta.env.VITE_STELLAR_PUBLIC_HORIZON_URL ??
    import.meta.env.VITE_STELLAR_HORIZON_URL ??
    "https://horizon.stellar.org",
  adminTokenConfigured: Boolean(import.meta.env.VITE_ADMIN_TOKEN?.length),
  supabaseConfigured: isSupabaseConfigured(),
  apiBackendConfigured: isApiBackendConfigured(),
  aiChatGatewayConfigured: Boolean(
    typeof import.meta.env.VITE_AI_CHAT_URL === "string" &&
      import.meta.env.VITE_AI_CHAT_URL.startsWith("http"),
  ),
  mainnetRoutingEnabled: MAINNET_ROUTING_ENABLED,
} as const;

export function logPublicEnvHealth(): void {
  if (import.meta.env.PROD) return;
  if (network !== "PUBLIC" && MAINNET_ROUTING_ENABLED) {
    console.info("[ROOTCHAIN] Non-PUBLIC build env with mainnet routing enabled.");
  }
  if (!publicEnv.supabaseConfigured && !publicEnv.apiBackendConfigured) {
    console.info("[ROOTCHAIN] No Supabase or API URL — persistence runs in local-only mode.");
  }
}

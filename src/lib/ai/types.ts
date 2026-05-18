import type { Page } from "@/lib/nav";

export type AiChatRole = "user" | "assistant";

export interface AiChatTurn {
  role: AiChatRole;
  content: string;
}

/** Serializable snapshot — safe to POST to your Edge Function / LLM gateway. */
export interface RootchainAssistantContext {
  routeId: Page;
  routeTitle: string;
  routeSubtitle: string;
  wallet: {
    connected: boolean;
    networkLabel: string;
    truncatedKey: string | null;
  };
  onboarding: {
    completed: boolean;
    stepIndex: number;
    stepCount: number;
  };
  portfolio: {
    positionCount: number;
    totalInvestedUsd: number;
    blendedRoiPct: number;
  };
  identity: {
    signedIn: boolean;
    role: string | null;
  };
  /** BCP-47 — future multilingual / African language packs. */
  locale: string;
  /** Coarse device hint for mobile-first copy. */
  viewport: "mobile" | "desktop";
  /** ISO timestamp for logs / gateway only. */
  clientNow: string;
}

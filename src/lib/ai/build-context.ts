import { PAGE_META, type Page } from "@/lib/nav";
import type { RootchainAssistantContext } from "@/lib/ai/types";
import { activeNetworkLabel } from "@/lib/stellar/config";
import { truncateAddr } from "@/lib/utils";

const ONBOARDING_STEPS = 3;

interface BuildContextInput {
  page: Page;
  walletConnected: boolean;
  walletPublicKey?: string | null;
  onboardingCompleted: boolean;
  onboardingStep: number;
  positionCount: number;
  totalInvestedUsd: number;
  blendedRoiPct: number;
  identitySignedIn: boolean;
  identityRole: string | null;
}

function viewportHint(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  return window.matchMedia?.("(max-width: 767px)")?.matches ? "mobile" : "desktop";
}

export function buildAssistantContext(input: BuildContextInput): RootchainAssistantContext {
  const meta = PAGE_META[input.page];
  const net = activeNetworkLabel();
  const pk = input.walletConnected && input.walletPublicKey?.length
    ? truncateAddr(input.walletPublicKey, 6, 4)
    : null;

  const locale =
    typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";

  return {
    routeId: input.page,
    routeTitle: meta.title,
    routeSubtitle: meta.subtitle,
    wallet: {
      connected: input.walletConnected,
      networkLabel: net,
      truncatedKey: pk,
    },
    onboarding: {
      completed: input.onboardingCompleted,
      stepIndex: input.onboardingStep,
      stepCount: ONBOARDING_STEPS,
    },
    portfolio: {
      positionCount: input.positionCount,
      totalInvestedUsd: input.totalInvestedUsd,
      blendedRoiPct: input.blendedRoiPct,
    },
    identity: {
      signedIn: input.identitySignedIn,
      role: input.identityRole,
    },
    locale,
    viewport: viewportHint(),
    clientNow: new Date().toISOString(),
  };
}

import type { RootchainAssistantContext } from "@/lib/ai/types";

function ctxLine(ctx: RootchainAssistantContext): string {
  const w = ctx.wallet.connected ? `wallet connected on ${ctx.wallet.networkLabel}` : "wallet not connected";
  const pf = `${ctx.portfolio.positionCount} harvest position(s), ~$${ctx.portfolio.totalInvestedUsd.toFixed(0)} allocated`;
  return `You're on "${ctx.routeTitle}". ${w}. Guided onboarding ${ctx.onboarding.completed ? "complete" : `in progress (step ${ctx.onboarding.stepIndex + 1}/${ctx.onboarding.stepCount})`}. Portfolio: ${pf}. Identity: ${ctx.identity.signedIn ? ctx.identity.role ?? "signed in" : "guest session"}.`;
}

function match(q: string, keys: string[]) {
  return keys.some((k) => q.includes(k));
}

/**
 * Offline / zero-token assistant — deterministic + context-grounded.
 * Swap for an LLM by wiring `VITE_AI_CHAT_URL` in `ai-chat.service.ts`.
 */
export function localAssistantReply(question: string, ctx: RootchainAssistantContext): string {
  const q = question.trim().toLowerCase();
  if (!q) {
    return `${ctxLine(ctx)}\n\nAsk me anything about ROOTCHAIN investments, wallets, escrow, Stellar settlement, or this screen.`;
  }

  const preamble =
    ctx.routeId === "wallet"
      ? "On Wallet, ROOTCHAIN summarizes your Stellar balances and recent transactions. Connect Freighter when you're ready for real USDC balances on testnet.\n\n"
      : ctx.routeId === "dashboard"
        ? "Portfolio Analytics aggregates your seeded and live allocations, disbursement pacing, and risk cues.\n\n"
        : ctx.routeId === "marketplace"
          ? "Marketplace listings show target raise, modeled ROI tiers, escrow milestones, and how shares map to fractional ownership certificates.\n\n"
          : ctx.routeId === "register"
            ? "Farmer onboarding captures cooperative metadata locally today; swap in Supabase storage plus verifier workflows later.\n\n"
            : "";

  if (match(q, ["hello", "hi ", " hey", "start", "help me"])) {
    return `${ctxLine(ctx)}\n\n${preamble}Try: How does escrow work? Explain Stellar settlements. What is ROI here? How do I connect my wallet?`;
  }

  if (match(q, ["navigation", "where", "go to", "open ", "dashboard", "menu"])) {
    return `${preamble}Use the left ROOTCHAIN navigator: Marketplace for harvest offers, Dashboard for exposures, Wallet for balances and transactions, Verification for attestations. On mobile tap the menu chip in the header. You're currently on "${ctx.routeTitle}".`;
  }

  if (match(q, ["wallet", "freighter", "connect", "public key", "address"])) {
    return `${ctx.routeId === "wallet" ? "Since you're already on Wallet, " : ""}Tap Connect Wallet in the header or sidebar card. ROOTCHAIN reads your public key for balances and prompts you to approve each transaction — private keys stay inside Freighter. ${ctx.wallet.connected ? `Looks like you're synced (${ctx.wallet.networkLabel}, ${ctx.wallet.truncatedKey ?? ""}).` : "You're not linked yet."}`;
  }

  if (match(q, ["stellar", "xlm", "horizon", "chain", "on-chain", "blockchain"])) {
    return "ROOTCHAIN pilots on Stellar testnet. Horizon indexes balances and transactions; milestones and share metadata can anchor hashes for audits. Settlement rails reference USDC on testnet alongside pilot RC-style share assets — production will harden issuer and oracle policy.";
  }

  if (match(q, ["usdc", "payment", "settle", "transfer"])) {
    return "Harvest investments model USDC principal on testnet flows. Connecting a funded account lets you simulate real invokes; otherwise MOCK latency still walks the escrow story with transparent memos.";
  }

  if (match(q, ["escrow", "milestone", "release", "disburse"])) {
    return "Capital stages into milestone escrow: funds unlock when farmers attest agronomic checkpoints. Dashboard shows blended disbursement pacing so investors see how much liquidity is still locked versus released.";
  }

  if (match(q, ["roi", "yield", "return", "performance"])) {
    const r = ctx.portfolio.blendedRoiPct;
    return `Listings cite modeled ROI from harvest economics, not guarantees. Your snapshot blends roughly ${r.toFixed(1)}% expectation across ${ctx.portfolio.positionCount} position(s); stress scenarios live under Risk tiers on each crop card.`;
  }

  if (match(q, ["risk", "safe", "loss"])) {
    return "Every tile carries a categorical risk band — Low, Moderate, or Higher — derived from agronomy and structuring assumptions. Regulatory-grade disclosures belong in Compliance — this pilot copy is educational only.";
  }

  if (match(q, ["token", "share", "ownership", "fraction"])) {
    return "Harvest lines tokenize fractional RC-style shares. Ownership previews during invest flow reference issued supply; certificates download once transactions anchor for demo storytelling.";
  }

  if (match(q, ["invest", "allocate", "marketplace", "crop", "listing"])) {
    return "Pick a verified listing, tap Invest, then choose allocation. Without a wallet you'll see guided mock execution; connected wallets orchestrate scripted USDC pathing with milestone memos tracked in Portfolio.";
  }

  if (match(q, ["farmer", "cooperative", "register", "producer"])) {
    return "Farmers navigate Farmer onboarding from Resources, outline cooperative metadata, and route evidence for operator review — pair with authenticated farmer profiles when enforcing Supabase auth.";
  }

  if (match(q, ["account", "sign in", "login", "auth", "supabase"])) {
    return "Accounts use Supabase Auth when operators enable VITE_SUPABASE_AUTH true. Email, Google SSO, hybrid storage for Remember me, and app_profiles map roles — distinct from ledger keys which stay custodied in Freighter.";
  }

  if (match(q, ["faq", "question", "how does"])) {
    return `${ctxLine(ctx)}\n\nHot topics:\n- Escrow pacing vs wallet balances\n- Stellar proofs and verification rails\n- Risk vs ROI interplay\n- Farmer vs investor journeys\nAsk in your own words and I'll contextualize using your current workspace state.`;
  }

  return `${ctxLine(ctx)}\n\nI'm running in local knowledge mode (no LLM gateway configured). Try rephrasing with keywords like wallet, escrow, ROI, or Stellar. To enable OpenAI-compatible answers, expose a secure VITE_AI_CHAT_URL gateway that proxies your API keys server-side — never embed provider secrets inside this SPA.`;
}

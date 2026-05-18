import type { AiChatTurn, RootchainAssistantContext } from "@/lib/ai/types";
import { localAssistantReply } from "@/lib/ai/local-assistant";
import { sanitizeAssistantReply } from "@/lib/ai/sanitize-assistant-text";

const MAX_VISIBLE_TURNS = 20;

/** Optional public token for your AI gateway (never your OpenAI secret). */
function gatewayHeaders(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const token = import.meta.env.VITE_AI_CHAT_PUBLIC_TOKEN as string | undefined;
  if (token) {
    h.Authorization = `Bearer ${token}`;
    h["X-Assistant-Token"] = token;
  }
  return h;
}

/**
 * Streams a single assistant completion.
 * - Without `VITE_AI_CHAT_URL`: uses local knowledge (free, private, instant).
 * - With gateway: POST JSON `{ messages, context }` — implement OpenAI (or other) on your server.
 */
export async function completeAssistantChat(
  turns: AiChatTurn[],
  ctx: RootchainAssistantContext,
): Promise<string> {
  const url = import.meta.env.VITE_AI_CHAT_URL as string | undefined;
  const history = turns.slice(-MAX_VISIBLE_TURNS);

  if (!url?.startsWith("http")) {
    const lastUser = [...history].reverse().find((m) => m.role === "user")?.content.trim() ?? "";
    return sanitizeAssistantReply(localAssistantReply(lastUser, ctx));
  }

  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 55_000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: gatewayHeaders(),
      body: JSON.stringify({ messages: history, context: ctx }),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      console.warn("[Assistant] gateway HTTP", res.status);
      const lastUser = [...history].reverse().find((m) => m.role === "user")?.content.trim() ?? "";
      return sanitizeAssistantReply(
        `${localAssistantReply(lastUser, ctx)}\n\n(Gateway returned ${res.status}; showing local answer.)`,
      );
    }

    const data = (await res.json()) as {
      content?: string;
      message?: { content?: string };
      reply?: string;
    };
    const reply = data.reply ?? data.message?.content ?? data.content ?? "";
    if (!reply.trim()) {
      const lastUser = [...history].reverse().find((m) => m.role === "user")?.content.trim() ?? "";
      return sanitizeAssistantReply(localAssistantReply(lastUser, ctx));
    }
    return sanitizeAssistantReply(reply.trim());
  } catch (e: unknown) {
    console.warn("[Assistant] gateway error", e);
    const lastUser = [...history].reverse().find((m) => m.role === "user")?.content.trim() ?? "";
    return sanitizeAssistantReply(
      `${localAssistantReply(lastUser, ctx)}\n\n(Assistant gateway unreachable; tuned local fallback.)`,
    );
  } finally {
    window.clearTimeout(timer);
  }
}

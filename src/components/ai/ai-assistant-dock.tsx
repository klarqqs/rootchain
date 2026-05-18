import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Mic,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Wallet,
  X,
} from "lucide-react";
import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { buildAssistantContext } from "@/lib/ai/build-context";
import type { AiChatTurn } from "@/lib/ai/types";
import { cn } from "@/lib/utils";
import type { Page } from "@/lib/nav";
import { speakAssistantText, stopAssistantSpeech } from "@/lib/ai/sanitize-assistant-text";
import { useVoiceAssistant } from "@/hooks/use-voice-assistant";
import { useWallet } from "@/hooks/use-wallet";
import { useOnboardingStore } from "@/store/onboarding.store";
import { usePortfolioStore } from "@/store/portfolio.store";
import { useIdentityStore } from "@/store/identity.store";
import { completeAssistantChat } from "@/services/ai-chat.service";
import { useNotificationsStore } from "@/store/notifications.store";
import { sanitizeAssistantReply } from "@/lib/ai/sanitize-assistant-text";

const ONBOARD_GUIDE_LINES = [
  "Create a Supabase-backed profile if your operator enforces SIGN IN.",
  "Connect Freighter via the CONNECT chip so Horizon can pull USDC balances.",
  "Explore Marketplace picks, vet ROI + risk tiers, then invest.",
  "Farmers jump to Farmer onboarding to stage cooperative dossiers.",
];

const DEFAULT_CHIPS = [
  "How does escrow protect capital?",
  "Explain Stellar + USDC on ROOTCHAIN.",
  "Where do I track my exposures?",
];

const PAGE_CHIPS: Partial<Record<Page, string[]>> = {
  home: [
    "What can I do first on ROOTCHAIN?",
    "Explain harvest investments briefly.",
    "How do wallets work here?",
  ],
  marketplace: [
    "How do I vet ROI vs risk?",
    "What happens after I tap Invest?",
    "Explain tokenized harvest shares.",
  ],
  dashboard: [
    "What do these disbursement gauges mean?",
    "How diversified is my book?",
    "Escrow pacing vs wallet balance?",
  ],
  wallet: [
    "How do Stellar deposits show up?",
    "Why Freighter approvals matter.",
    "What network am I routed through?",
  ],
  verification: [
    "What does verification prove?",
    "How does transparency help investors?",
    "Link between QR attestations & Horizon?",
  ],
  register: DEFAULT_CHIPS,
  help: DEFAULT_CHIPS,
  compliance: DEFAULT_CHIPS,
  community: DEFAULT_CHIPS,
};

interface AiAssistantDockProps {
  page: Page;
  onOpenWalletModal: () => void;
}

export function AiAssistantDock({ page, onOpenWalletModal }: AiAssistantDockProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [voiceHint, setVoiceHint] = useState("");
  const [thinking, setThinking] = useState(false);
  const [voiceResponses, setVoiceResponses] = useState(false);
  const [msgs, setMsgs] = useState<AiChatTurn[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm RootX — your ROOTCHAIN assistant. I run local-first with an optional gateway. Tap a shortcut or describe what you need.",
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);
  const pushToast = useNotificationsStore((s) => s.push);
  const { isConnected, account } = useWallet();
  const onboarding = useOnboardingStore(useShallow((s) => ({ completed: s.completed, step: s.step })));
  const portfolio = usePortfolioStore(
    useShallow((s) => ({
      count: s.positions.length,
      invested: s.snapshot.totalInvested,
      blendedRoi: s.snapshot.blendedRoi,
    })),
  );
  const signedIn = useIdentityStore((s) => !!s.session?.user);
  const identityRole = useIdentityStore((s) => s.profile?.role ?? null);

  const locale =
    typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";

  const voiceApi = useVoiceAssistant({ lang: locale });

  const gatewayActive = Boolean(
    typeof import.meta.env.VITE_AI_CHAT_URL === "string" &&
      import.meta.env.VITE_AI_CHAT_URL.startsWith("http"),
  );

  const ctxPack = useMemo(
    () =>
      buildAssistantContext({
        page,
        walletConnected: isConnected,
        walletPublicKey: account?.publicKey,
        onboardingCompleted: onboarding.completed,
        onboardingStep: onboarding.step,
        positionCount: portfolio.count,
        totalInvestedUsd: portfolio.invested,
        blendedRoiPct: portfolio.blendedRoi,
        identitySignedIn: signedIn,
        identityRole,
      }),
    [
      account?.publicKey,
      identityRole,
      isConnected,
      onboarding.completed,
      onboarding.step,
      page,
      portfolio.blendedRoi,
      portfolio.count,
      portfolio.invested,
      signedIn,
    ],
  );

  useEffect(() => {
    if (!open) stopAssistantSpeech();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open, thinking]);

  const chips = PAGE_CHIPS[page] ?? DEFAULT_CHIPS;

  const sendPrompt = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    const userTurn: AiChatTurn = { role: "user", content: trimmed };
    const nextHist = [...msgs, userTurn];
    setMsgs(nextHist);
    setInput("");
    setVoiceHint("");
    stopAssistantSpeech();
    setThinking(true);
    try {
      const reply = await completeAssistantChat(nextHist, ctxPack);
      await new Promise((r) => setTimeout(r, 400));
      setMsgs([...nextHist, { role: "assistant", content: reply }]);
      if (voiceResponses)
        void speakAssistantText(reply, locale).catch(() => {
          /* TTS unsupported or interrupted */
        });
    } catch (e: unknown) {
      pushToast({
        tone: "error",
        title: "Assistant stalled",
        description: e instanceof Error ? e.message : "Try again shortly.",
      });
      setMsgs([
        ...nextHist,
        {
          role: "assistant",
          content: sanitizeAssistantReply("I hit an internal snag — ask again whenever you're ready."),
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const toggleMic = () => {
    if (!voiceApi.supported) {
      pushToast({
        tone: "warning",
        title: "Voice capture unavailable",
        description: "Use Chrome / Edge desktop or Safari 16 for speech-to-text.",
      });
      return;
    }
    if (voiceApi.listening) {
      voiceApi.stopCapture();
      setVoiceHint("");
      return;
    }
    stopAssistantSpeech();
    voiceApi.startCapture(
      (interim) => setVoiceHint(interim),
      (finalTxt) => {
        const f = finalTxt.trim();
        if (!f) return;
        setInput((prev) => {
          const p = prev.trim();
          return p ? `${p} ${f}` : f;
        });
        setVoiceHint("");
      },
    );
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendPrompt(input);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open RootX assistant"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0.75, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 340, damping: 22 }}
        className={cn(
          "fixed bottom-28 right-5 md:right-8 z-[108] rounded-full shadow-[0_12px_40px_-12px_rgba(132,204,22,0.55)] flex items-center justify-center",
          open && "hidden",
        )}
        style={{
          width: 62,
          height: 62,
          background:
            "linear-gradient(135deg,rgba(101,247,221,1) 0%,rgba(74,208,143,1) 50%,rgba(132,204,22,1) 100%)",
        }}
      >
        <Bot className="w-9 h-9 text-black" strokeWidth={2.3} aria-hidden />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[107] flex items-end sm:items-center justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-8"
            aria-modal="true"
            role="dialog"
            aria-label="RootX assistant"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/76 backdrop-blur-md"
              onClick={() => setOpen(false)}
              aria-label="Close assistant backdrop"
            />
            <motion.div
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.28 }}
              className="relative w-full max-w-lg max-h-[min(88vh,780px)] flex flex-col gap-3"
            >
              <Glass className="p-4 sm:p-5 flex flex-col gap-3 elevated max-h-full min-h-0" glow>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-lime-400/20 border border-lime-400/40 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-lime-200" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill color="lime" icon={Bot}>
                        RootX
                      </Pill>
                      <Pill color={gatewayActive ? "purple" : "ash"}>
                        {gatewayActive ? "LLM gateway" : "Local brain"}
                      </Pill>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Contextual help for investors, farmers, and first-time guests. Voice captures stay in-browser;
                      gateway mode keeps secrets off-device.
                    </p>
                  </div>
                  <Btn variant="ghost" size="sm" aria-label="Close assistant" icon={X} onClick={() => setOpen(false)} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Btn
                    variant={voiceResponses ? "primary" : "outline"}
                    size="sm"
                    icon={voiceResponses ? Volume2 : VolumeX}
                    onClick={() => {
                      setVoiceResponses((v) => {
                        const next = !v;
                        if (!next) stopAssistantSpeech();
                        return next;
                      });
                    }}
                  >
                    {voiceResponses ? "Voice replies on" : "Voice replies muted"}
                  </Btn>
                  <Btn variant="outline" size="sm" icon={Wallet} onClick={onOpenWalletModal}>
                    Wallet panel
                  </Btn>
                </div>

                {!onboarding.completed && (
                  <Glass className="p-3 bg-violet-500/[0.04] border border-violet-500/25">
                    <div className="text-[11px] font-black uppercase tracking-widest text-violet-300">
                      Guided onboarding narration
                    </div>
                    <ul className="mt-2 text-xs text-slate-400 space-y-1">
                      {ONBOARD_GUIDE_LINES.map((line) => (
                        <li key={line}>• {line}</li>
                      ))}
                    </ul>
                  </Glass>
                )}

                <div className="flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => void sendPrompt(chip)}
                      disabled={thinking}
                      className="touch-manipulation text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/10 hover:border-lime-400/50 text-lime-200/90 hover:text-white transition"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div
                  ref={listRef}
                  className="flex-1 overflow-y-auto min-h-[192px] max-h-[min(46vh,360px)] space-y-3 pr-1"
                >
                  {msgs.map((m, idx) => (
                    <motion.div
                      key={`assist-${idx}`}
                      layout
                      initial={{ opacity: 0, x: m.role === "user" ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "flex",
                        m.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[92%]",
                          m.role === "user"
                            ? "bg-emerald-500/15 border border-emerald-500/35 text-emerald-50 ml-6"
                            : "bg-black/38 border border-white/[0.08] text-slate-100 mr-4",
                        )}
                      >
                        {m.content.split("\n").map((line, i) => (
                          <p key={i} className={i === 0 ? "" : "mt-2"}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                  {thinking && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1.5 rounded-2xl px-4 py-2.5 bg-black/40 border border-white/10 mr-16">
                        <span className="w-2 h-2 rounded-full bg-lime-400/80 animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-lime-400/70 animate-pulse [animation-delay:120ms]" />
                        <span className="w-2 h-2 rounded-full bg-lime-400/60 animate-pulse [animation-delay:240ms]" />
                        <span className="ml-2 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                          Reasoning…
                        </span>
                      </div>
                    </div>
                  )}
                  {/* aria-live announces latest assistant replies when screen readers refresh */}
                </div>

                {(voiceHint || voiceApi.error) && (
                  <div className="text-[11px] text-slate-500">
                    {voiceApi.error ?? (voiceHint ? `Listening draft: "${voiceHint}"` : "")}
                  </div>
                )}

                <div className="flex gap-2 items-end pt-2 border-t border-white/[0.05] mt-2">
                  <input
                    className="flex-1 bg-black/30 border border-line rounded-xl px-3 py-3 text-sm text-white outline-none focus-ring placeholder:text-slate-600"
                    placeholder="Ask about escrow, dashboards, wallets, investments…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    disabled={thinking}
                  />
                  <Btn
                    variant="outline"
                    size="md"
                    icon={Mic}
                    className={cn(
                      voiceApi.listening &&
                        "border-rose-400/60 text-rose-50 shadow-[0_0_22px_-4px_rgba(244,63,94,0.45)] animate-pulse",
                    )}
                    onClick={() => toggleMic()}
                    disabled={thinking}
                    aria-label={voiceApi.listening ? "Stop voice capture" : "Start voice capture"}
                  />
                  <Btn variant="primary" size="md" icon={Send} onClick={() => void sendPrompt(input)} disabled={thinking}>
                    Ask
                  </Btn>
                </div>
              </Glass>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

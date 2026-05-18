import { motion } from "framer-motion";
import { Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { dbAvailable } from "@/database/client";
import type { Page } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { requestPasswordReset } from "@/services/auth-session.service";
import { useNotificationsStore } from "@/store/notifications.store";

interface ForgotPasswordPageProps {
  setPage: (p: Page) => void;
}

export function ForgotPasswordPage({ setPage }: ForgotPasswordPageProps) {
  const push = useNotificationsStore((s) => s.push);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentHint, setSentHint] = useState(false);

  if (!dbAvailable) {
    return (
      <Glass className="p-10 max-w-lg mx-auto text-center space-y-3">
        <MailCheck className="w-7 h-7 text-amber-300 mx-auto" />
        <p className="text-sm text-slate-400">Supabase backend not configured.</p>
      </Glass>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-20">
      <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Glass className="p-8 space-y-5 elevated" glow>
          <div className="text-center space-y-1">
            <Pill color="ash" icon={MailCheck}>Password recovery</Pill>
            <h1 className="font-black text-3xl text-white tracking-tight mt-4">Reset via email</h1>
            <p className="text-sm text-slate-500 mt-2">
              We mint a privileged recovery JWT that requires you to establish a fresh password immediately after the
              link opens.
            </p>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500">Registered email</label>
            <input
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "mt-2 w-full bg-black/30 border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus-ring",
              )}
            />
          </div>

          <Btn
            variant="primary"
            fullWidth
            icon={busy ? Loader2 : MailCheck}
            disabled={busy || !email.trim()}
            onClick={async () => {
              try {
                setBusy(true);
                await requestPasswordReset(email);
                setSentHint(true);
                push({
                  tone: "success",
                  title: "Recovery dispatched",
                  description: "Inspect secure mail within a few minutes.",
                  duration: 5200,
                });
              } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : "Reset failed.";
                push({ tone: "error", title: "Can't send recovery", description: msg, duration: 5200 });
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Encrypting envelope…" : "Send magic link"}
          </Btn>

          {sentHint && (
            <div className="text-xs text-emerald-200 font-bold text-center animate-pulse">
              Link routes with <span className="text-white">auth=recovery</span> sentinel so we hydrate high-assurance UX.
            </div>
          )}

          <div className="text-center text-xs text-slate-500 font-bold pt-4">
            <button type="button" className="hover:text-white" onClick={() => setPage("login")}>
              ← Back to sign in
            </button>
          </div>
        </Glass>
      </motion.div>
    </div>
  );
}

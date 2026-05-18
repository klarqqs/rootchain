import { motion } from "framer-motion";
import { Loader2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { dbAvailable } from "@/database/client";
import type { Page } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { consumeReturnPage } from "@/lib/auth-routes";
import {
  signInWithEmail,
  signInWithGoogle,
} from "@/services/auth-session.service";
import { useNotificationsStore } from "@/store/notifications.store";

interface LoginPageProps {
  setPage: (p: Page) => void;
}

export function LoginPage({ setPage }: LoginPageProps) {
  const push = useNotificationsStore((s) => s.push);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState<null | "email" | "google">(null);

  if (!dbAvailable) {
    return (
      <Glass className="p-10 max-w-lg mx-auto text-center space-y-3">
        <LockKeyhole className="w-7 h-7 text-amber-300 mx-auto" />
        <h1 className="font-black text-2xl text-white">Authentication unavailable</h1>
        <p className="text-sm text-slate-400">
          Configure valid <code className="text-lime-200">VITE_SUPABASE_URL</code> an{" "}
          <code className="text-lime-200">VITE_SUPABASE_ANON_KEY</code> credentials to enable ROOTCHAIN login.
        </p>
      </Glass>
    );
  }

  const finishSuccess = () => {
    push({
      tone: "success",
      title: "Welcome back",
      description: "Session secured — syncing your dashboards.",
      duration: 3400,
    });
    const next = consumeReturnPage("home");
    setPage(next);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-20">
      <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Glass className="p-8 space-y-6 elevated" glow>
          <div className="space-y-1 text-center">
            <Pill color="lime" icon={ShieldCheck}>
              ROOTCHAIN Secure Access
            </Pill>
            <h1 className="font-black text-3xl text-white tracking-tight mt-4">Sign in</h1>
            <p className="text-sm text-slate-500 mt-2">
              Institutional-grade session handling with JWT refresh backed by Supabase.
            </p>
          </div>

          <div className="space-y-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />
            <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="accent-lime-400 rounded border-line"
              />
              Remember this device · keeps refresh tokens in persistent storage until you revoke.
            </label>
          </div>

          <div className="space-y-3">
            <Btn
              variant="primary"
              icon={busy === "email" ? Loader2 : LockKeyhole}
              fullWidth
              disabled={!email.trim() || !password || busy !== null}
              onClick={async () => {
                try {
                  setBusy("email");
                  await signInWithEmail(email, password, remember);
                  finishSuccess();
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : "Sign-in rejected.";
                  push({ tone: "error", title: "Sign-in failed", description: msg, duration: 5200 });
                } finally {
                  setBusy(null);
                }
              }}
            >
              {busy === "email" ? "Securing session…" : "Continue"}
            </Btn>
            <Btn
              variant="outline"
              icon={busy === "google" ? Loader2 : Sparkles}
              fullWidth
              disabled={busy !== null}
              onClick={async () => {
                try {
                  setBusy("google");
                  await signInWithGoogle(remember);
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : "Google SSO failed.";
                  push({ tone: "error", title: "OAuth", description: msg, duration: 5200 });
                  setBusy(null);
                }
              }}
            >
              {busy === "google" ? "Redirecting…" : "Continue with Google"}
            </Btn>
          </div>

          <div className="flex justify-between items-center pt-2 text-xs font-bold text-slate-500">
            <button type="button" className="text-lime-300 hover:text-lime-200 underline-offset-2 hover:underline" onClick={() => setPage("forgot-password")}>
              Forgot password
            </button>
            <button type="button" className="hover:text-white" onClick={() => setPage("signup")}>
              Create account →
            </button>
          </div>
          <Glass className="p-4 border border-dashed border-white/10 bg-black/40">
            <div className="text-[11px] text-slate-500 leading-snug font-medium">
              <span className="text-lime-200 font-bold uppercase tracking-[0.2em]">Wallet link</span> remains your
              settlement authority — ROOTCHAIN profiles map human identity separately from ledger keys so you retain
              control of treasury accounts.
            </div>
          </Glass>
        </Glass>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase text-slate-500">{label}</label>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "mt-2 w-full bg-black/30 border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus-ring",
        )}
      />
    </div>
  );
}

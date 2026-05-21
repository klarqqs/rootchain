import { motion } from "framer-motion";
import { Loader2, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { AuthSetupRequired } from "@/components/auth/auth-setup-required";
import { dbAvailable } from "@/database/client";
import type { Page } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { consumeReturnPage } from "@/lib/auth-routes";
import {
  sendEmailSignInOtp,
  signInWithEmail,
  signInWithGoogle,
  verifyEmailOtp,
} from "@/services/auth-session.service";
import { useNotificationsStore } from "@/store/notifications.store";

interface LoginPageProps {
  setPage: (p: Page) => void;
}

type AuthMethod = "password" | "otp";
type Busy = null | "email" | "google" | "otpSend" | "otpVerify";

export function LoginPage({ setPage }: LoginPageProps) {
  const push = useNotificationsStore((s) => s.push);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [method, setMethod] = useState<AuthMethod>("password");
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [busy, setBusy] = useState<Busy>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = window.setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [resendCooldown]);

  if (!dbAvailable) {
    return <AuthSetupRequired title="Sign-in unavailable" setPage={setPage} />;
  }

  const setAuthMethod = (m: AuthMethod) => {
    setMethod(m);
    setOtpSent(false);
    setOtpToken("");
    setResendCooldown(0);
  };

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

  const sendLoginOtp = async () => {
    try {
      setBusy("otpSend");
      await sendEmailSignInOtp(email, remember);
      setOtpSent(true);
      setOtpToken("");
      setResendCooldown(60);
      push({
        tone: "success",
        title: "Check your email",
        description: "We sent a 6-digit sign-in code.",
        duration: 6000,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not send code.";
      push({ tone: "error", title: "Email sign-in", description: msg, duration: 6200 });
    } finally {
      setBusy(null);
    }
  };

  const verifyLoginOtp = async () => {
    const trimmed = otpToken.replace(/\s/g, "");
    if (trimmed.length < 6) {
      push({ tone: "warning", title: "Enter the full code", description: "All 6 digits are required.", duration: 4000 });
      return;
    }
    try {
      setBusy("otpVerify");
      await verifyEmailOtp(email, trimmed, remember);
      finishSuccess();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid or expired code.";
      push({ tone: "error", title: "Verification failed", description: msg, duration: 6200 });
    } finally {
      setBusy(null);
    }
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

          <div className="flex rounded-xl border border-white/[0.08] p-1 bg-black/30">
            <button
              type="button"
              onClick={() => setAuthMethod("password")}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wide transition-colors",
                method === "password" ? "bg-emerald-500/20 text-white" : "text-slate-500 hover:text-slate-300",
              )}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod("otp")}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wide transition-colors",
                method === "otp" ? "bg-emerald-500/20 text-white" : "text-slate-500 hover:text-slate-300",
              )}
            >
              Email code
            </button>
          </div>

          <div className="space-y-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
            <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="accent-lime-400 rounded border-line"
              />
              Remember this device · keeps refresh tokens in persistent storage until you revoke.
            </label>

            {method === "password" && (
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
              />
            )}

            {method === "otp" && otpSent && (
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">6-digit code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={12}
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value.replace(/[^\d\s]/g, ""))}
                  placeholder="000000"
                  className={cn(
                    "mt-2 w-full bg-black/30 border border-line rounded-xl px-3 py-2.5 text-sm font-mono tracking-[0.25em] text-white outline-none focus-ring text-center",
                  )}
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            {method === "password" ? (
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
            ) : (
              <>
                {!otpSent ? (
                  <Btn
                    variant="primary"
                    icon={busy === "otpSend" ? Loader2 : Mail}
                    fullWidth
                    disabled={!email.trim() || busy !== null}
                    onClick={() => void sendLoginOtp()}
                  >
                    {busy === "otpSend" ? "Sending code…" : "Email me a sign-in code"}
                  </Btn>
                ) : (
                  <>
                    <Btn
                      variant="primary"
                      icon={busy === "otpVerify" ? Loader2 : LockKeyhole}
                      fullWidth
                      disabled={busy !== null || otpToken.replace(/\s/g, "").length < 6}
                      onClick={() => void verifyLoginOtp()}
                    >
                      {busy === "otpVerify" ? "Verifying…" : "Verify code & continue"}
                    </Btn>
                    <Btn
                      variant="outline"
                      fullWidth
                      disabled={busy !== null || resendCooldown > 0}
                      onClick={() => void sendLoginOtp()}
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                    </Btn>
                    <Btn
                      variant="ghost"
                      fullWidth
                      onClick={() => {
                        setOtpSent(false);
                        setOtpToken("");
                        setResendCooldown(0);
                      }}
                    >
                      Use a different email
                    </Btn>
                  </>
                )}
              </>
            )}
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

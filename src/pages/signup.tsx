import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Landmark,
  Mail,
  Shield,
  Sprout,
  Tractor,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { AuthSetupRequired } from "@/components/auth/auth-setup-required";
import { dbAvailable } from "@/database/client";
import type { AppProfileRow } from "@/database/types";
import type { Page } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { consumeReturnPage } from "@/lib/auth-routes";
import { isApiBackendConfigured } from "@/lib/api/config";
import {
  registerWithEmailApi,
  sendEmailSignUpOtp,
  setPasswordForCurrentUser,
  verifyEmailOtp,
} from "@/services/auth-session.service";
import { useNotificationsStore } from "@/store/notifications.store";
import {
  clearStashedSignupPersonaRole,
  peekSignupPersonaRole,
  peekUrlSignupIntent,
} from "@/lib/signup-intent";

const COUNTRIES = [
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "OTHER", name: "Other / diaspora" },
] as const;

type RoleChoice = Exclude<AppProfileRow["role"], "admin">;

const SIGNUP_STEPS = ["persona", "profile", "security", "compliance", "review", "verify"] as const;
type Step = (typeof SIGNUP_STEPS)[number];

interface SignupPageProps {
  setPage: (p: Page) => void;
}

function initialSignupStep(): Step {
  const picked = peekSignupPersonaRole() ?? peekUrlSignupIntent();
  return picked ? "profile" : "persona";
}

function initialSignupRole(): RoleChoice {
  return peekSignupPersonaRole() ?? peekUrlSignupIntent() ?? "investor";
}

export function SignupPage({ setPage }: SignupPageProps) {
  const push = useNotificationsStore((s) => s.push);
  const [step, setStep] = useState<Step>(initialSignupStep);
  const [role, setRole] = useState<RoleChoice>(initialSignupRole);
  const [busy, setBusy] = useState(false);

  const [fullLegalName, setFullLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<string>("NG");
  const [organization, setOrganization] = useState("");
  const [farmRegion, setFarmRegion] = useState("");
  const [heardFrom, setHeardFrom] = useState("");
  const [investmentExperience, setInvestmentExperience] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeRisk, setAgreeRisk] = useState(false);
  const [agreeAccuracy, setAgreeAccuracy] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    clearStashedSignupPersonaRole();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = window.setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [resendCooldown]);

  const stepIndex = useMemo(() => SIGNUP_STEPS.indexOf(step), [step]);

  const canAdvanceProfile =
    fullLegalName.trim().length >= 3 &&
    displayName.trim().length >= 2 &&
    phone.trim().length >= 8 &&
    (role === "investor" ? investmentExperience.trim().length >= 3 : organization.trim().length >= 2);

  const canAdvanceSecurity =
    email.includes("@") && password.length >= 10 && password === confirmPassword;

  const canSubmitCompliance =
    agreeTerms && agreePrivacy && agreeRisk && agreeAccuracy;

  if (!dbAvailable) {
    return <AuthSetupRequired title="Cannot register yet" setPage={setPage} />;
  }

  const goNext = () => {
    if (step === "persona") setStep("profile");
    else if (step === "profile" && canAdvanceProfile) setStep("security");
    else if (step === "security" && canAdvanceSecurity) setStep("compliance");
    else if (step === "compliance" && canSubmitCompliance) setStep("review");
  };

  const goBack = () => {
    if (step === "profile") setStep("persona");
    else if (step === "security") setStep("profile");
    else if (step === "compliance") setStep("security");
    else if (step === "review") setStep("compliance");
    else if (step === "verify") setStep("review");
  };

  const buildProfileMeta = (): Record<string, string | boolean> => {
    const profileMeta: Record<string, string | boolean> = {
      display_name: displayName.trim(),
      phone: phone.trim(),
      country,
      heard_from: heardFrom.trim() || "unspecified",
      marketing_opt_in: marketingOptIn,
      terms_v1: agreeTerms,
      privacy_v1: agreePrivacy,
      risk_ack_v1: agreeRisk,
      accuracy_attestation: agreeAccuracy,
    };
    if (role === "farmer") {
      profileMeta.organization = organization.trim();
      profileMeta.farm_region = farmRegion.trim() || "unspecified";
    } else {
      profileMeta.investment_experience = investmentExperience.trim();
    }
    return profileMeta;
  };

  const sendSignupOtp = async () => {
    try {
      setBusy(true);
      if (isApiBackendConfigured()) {
        await registerWithEmailApi({
          email,
          password,
          fullName: fullLegalName.trim(),
          role: role === "farmer" ? "FARMER" : "INVESTOR",
        });
        push({
          tone: "success",
          title: "Account created",
          description: "Your workspace is ready — syncing dashboards.",
          duration: 5600,
        });
        setPage(consumeReturnPage("home"));
        return;
      }

      await sendEmailSignUpOtp({
        email,
        role,
        fullName: fullLegalName.trim(),
        profileMeta: buildProfileMeta(),
      });
      setOtpCode("");
      setResendCooldown(60);
      setStep("verify");
      push({
        tone: "success",
        title: "Check your email",
        description: "We sent a 6-digit verification code to your inbox.",
        duration: 7200,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unable to send verification code.";
      push({ tone: "error", title: "Email not sent", description: msg, duration: 7200 });
    } finally {
      setBusy(false);
    }
  };

  const resendSignupOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      setBusy(true);
      await sendEmailSignUpOtp({
        email,
        role,
        fullName: fullLegalName.trim(),
        profileMeta: buildProfileMeta(),
      });
      setResendCooldown(60);
      push({ tone: "info", title: "Code resent", description: "Use the newest code from your email.", duration: 5000 });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unable to resend code.";
      push({ tone: "error", title: "Resend failed", description: msg, duration: 6200 });
    } finally {
      setBusy(false);
    }
  };

  const completeSignupWithOtp = async () => {
    const trimmed = otpCode.replace(/\s/g, "");
    if (trimmed.length < 6) {
      push({ tone: "warning", title: "Enter the full code", description: "Paste or type all 6 digits from the email.", duration: 4000 });
      return;
    }
    try {
      setBusy(true);
      await verifyEmailOtp(email, trimmed, true);
      await setPasswordForCurrentUser(password);
      push({
        tone: "success",
        title: "Workspace live",
        description: "Email verified and password saved — syncing dashboards.",
        duration: 5600,
      });
      setPage(consumeReturnPage("home"));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Verification failed.";
      push({ tone: "error", title: "Could not verify", description: msg, duration: 7200 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 px-1">
      <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">
        <span>
          Step {stepIndex + 1} / 6 · {step.replace("-", " ")}
        </span>
        <div className="flex gap-1 flex-1 max-w-[240px]">
          {SIGNUP_STEPS.map((s, i) => (
            <div
              key={s}
              className={cn("h-1 flex-1 rounded-full", i <= stepIndex ? "bg-emerald-500" : "bg-white/10")}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22 }}
        >
          <Glass className="p-7 sm:p-9 space-y-6 elevated border-emerald-500/10" glow>
            {step === "persona" && (
              <>
                <div className="text-center space-y-2">
                  <Pill color="purple" icon={Sprout}>
                    Join RootChain
                  </Pill>
                  <h1 className="font-black text-2xl sm:text-3xl text-white tracking-tight">How will you use the platform?</h1>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    We provision different dashboards, disclosures, and intake flows. You can’t self-elevate to admin
                    — operators handle that separately.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <PersonaCard
                    icon={Landmark}
                    title="Investor"
                    subtitle="Deploy capital, track harvest exposures, and settle in USDC-aligned rails."
                    selected={role === "investor"}
                    onClick={() => setRole("investor")}
                  />
                  <PersonaCard
                    icon={Tractor}
                    title="Farmer / cooperative"
                    subtitle="Register programs, publish milestones, and route evidence to operators."
                    selected={role === "farmer"}
                    onClick={() => setRole("farmer")}
                  />
                </div>
                <Btn variant="primary" iconRight={ArrowRight} fullWidth onClick={() => setStep("profile")}>
                  Continue as {role === "investor" ? "investor" : "farmer"}
                </Btn>
              </>
            )}

            {step === "profile" && (
              <>
                <div className="space-y-1">
                  <Pill color="emerald">Identity &amp; contact</Pill>
                  <h1 className="font-black text-2xl text-white tracking-tight">Build institutional trust</h1>
                  <p className="text-sm text-slate-500">
                    These fields mirror what regulated AgriFi pilots ask for before moving money. Nothing here replaces
                    KYC/AML with your banking partners — it primes your workspace.
                  </p>
                </div>
                <Field label="Full legal name" value={fullLegalName} onChange={setFullLegalName} autoComplete="name" />
                <Field label="Preferred display name" value={displayName} onChange={setDisplayName} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Phone (incl. country code)" value={phone} onChange={setPhone} autoComplete="tel" />
                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-500">Country / region</label>
                    <div className="relative mt-2">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-black/30 border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus-ring appearance-none pr-10"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                </div>
                {role === "farmer" ? (
                  <>
                    <Field
                      label="Cooperative / legal entity name"
                      value={organization}
                      onChange={setOrganization}
                    />
                    <Field label="Primary operating region" value={farmRegion} onChange={setFarmRegion} />
                  </>
                ) : (
                  <Field
                    label="Describe your investment experience (1–2 sentences)"
                    value={investmentExperience}
                    onChange={setInvestmentExperience}
                  />
                )}
                <Field label="How did you hear about RootChain? (optional)" value={heardFrom} onChange={setHeardFrom} />
                <div className="flex gap-2">
                  <Btn variant="ghost" icon={ArrowLeft} onClick={goBack}>
                    Back
                  </Btn>
                  <Btn variant="primary" iconRight={ArrowRight} className="flex-1" disabled={!canAdvanceProfile} onClick={goNext}>
                    Continue
                  </Btn>
                </div>
              </>
            )}

            {step === "security" && (
              <>
                <div className="space-y-1">
                  <Pill color="lime">Secure access</Pill>
                  <h1 className="font-black text-2xl text-white tracking-tight">Credential vault</h1>
                  <p className="text-sm text-slate-500">
                    Minimum 10 characters. Use a unique passphrase. After review, we email a 6-digit code to this address
                    before your account goes live.
                  </p>
                </div>
                <Field label="Professional email" value={email} onChange={setEmail} type="email" autoComplete="email" />
                <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
                <Field
                  label="Confirm password"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                />
                <div className="flex gap-2">
                  <Btn variant="ghost" icon={ArrowLeft} onClick={goBack}>
                    Back
                  </Btn>
                  <Btn variant="primary" iconRight={ArrowRight} className="flex-1" disabled={!canAdvanceSecurity} onClick={goNext}>
                    Continue
                  </Btn>
                </div>
              </>
            )}

            {step === "compliance" && (
              <>
                <div className="space-y-1">
                  <Pill color="amber" icon={Shield}>
                    Disclosures
                  </Pill>
                  <h1 className="font-black text-2xl text-white tracking-tight">Acknowledgements</h1>
                  <p className="text-sm text-slate-500">
                    Pilot flows are not investment advice. Confirm you understand the posture before verifying your
                    email and opening the workspace.
                  </p>
                </div>
                <CheckRow checked={agreeTerms} onChange={setAgreeTerms} label="I have read and agree to the Terms of Service." onOpen={() => setPage("terms")} />
                <CheckRow checked={agreePrivacy} onChange={setAgreePrivacy} label="I have read the Privacy Policy." onOpen={() => setPage("privacy")} />
                <CheckRow checked={agreeRisk} onChange={setAgreeRisk} label="I understand harvest projections are illustrative and not guarantees of return." onOpen={() => setPage("compliance")} />
                <CheckRow
                  checked={agreeAccuracy}
                  onChange={setAgreeAccuracy}
                  label="I attest that the information I provided is accurate to the best of my knowledge."
                />
                <label className="flex items-start gap-3 text-sm text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="mt-1 accent-emerald-400 rounded border-line"
                  />
                  <span>Send me product updates and pilot invitations (optional).</span>
                </label>
                <div className="flex gap-2">
                  <Btn variant="ghost" icon={ArrowLeft} onClick={goBack}>
                    Back
                  </Btn>
                  <Btn variant="primary" iconRight={ArrowRight} className="flex-1" disabled={!canSubmitCompliance} onClick={goNext}>
                    Review application
                  </Btn>
                </div>
              </>
            )}

            {step === "review" && (
              <>
                <div className="space-y-1">
                  <Pill color="purple">Review</Pill>
                  <h1 className="font-black text-2xl text-white tracking-tight">Send verification code</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    We will email <span className="text-slate-300 font-semibold">{email}</span> a one-time code. You
                    will set access after you enter it.
                  </p>
                </div>
                <Glass className="p-4 space-y-2 text-sm border-white/[0.06]">
                  <ReviewRow k="Role" v={role === "investor" ? "Investor" : "Farmer / cooperative"} />
                  <ReviewRow k="Legal name" v={fullLegalName} />
                  <ReviewRow k="Email" v={email} />
                  <ReviewRow k="Country" v={COUNTRIES.find((c) => c.code === country)?.name ?? country} />
                  {role === "farmer" ? (
                    <>
                      <ReviewRow k="Entity" v={organization} />
                      <ReviewRow k="Region" v={farmRegion || "—"} />
                    </>
                  ) : (
                    <ReviewRow k="Experience" v={investmentExperience} />
                  )}
                </Glass>
                <div className="flex gap-2">
                  <Btn variant="ghost" icon={ArrowLeft} onClick={goBack}>
                    Back
                  </Btn>
                  <Btn
                    variant="primary"
                    icon={Mail}
                    loading={busy}
                    className="flex-1"
                    disabled={busy}
                    onClick={() => void sendSignupOtp()}
                  >
                    Email me a 6-digit code
                  </Btn>
                </div>
              </>
            )}

            {step === "verify" && (
              <>
                <div className="space-y-1">
                  <Pill color="lime" icon={Mail}>
                    Verify email
                  </Pill>
                  <h1 className="font-black text-2xl text-white tracking-tight">Enter the code from your email</h1>
                  <p className="text-sm text-slate-500">
                    Check spam folders. Codes expire quickly — request a new one if needed.
                  </p>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500">6-digit code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={12}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^\d\s]/g, ""))}
                    placeholder="000000"
                    className={cn(
                      "mt-2 w-full bg-black/30 border border-line rounded-xl px-3 py-3 text-lg tracking-[0.35em] font-mono text-white outline-none focus-ring text-center",
                    )}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Btn variant="ghost" icon={ArrowLeft} onClick={goBack} disabled={busy}>
                    Back
                  </Btn>
                  <Btn
                    variant="outline"
                    className="sm:flex-initial"
                    disabled={busy || resendCooldown > 0}
                    onClick={() => void resendSignupOtp()}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </Btn>
                  <Btn
                    variant="primary"
                    icon={Sprout}
                    loading={busy}
                    className="flex-1"
                    disabled={busy || otpCode.replace(/\s/g, "").length < 6}
                    onClick={() => void completeSignupWithOtp()}
                  >
                    Verify &amp; save password
                  </Btn>
                </div>
              </>
            )}
          </Glass>
        </motion.div>
      </AnimatePresence>

      <div className="text-xs text-center text-slate-500 font-bold space-x-4">
        <button type="button" className="hover:text-white" onClick={() => setPage("login")}>
          ← Existing member
        </button>
        <span className="text-slate-700">|</span>
        <button type="button" className="text-lime-300 hover:text-lime-200 hover:underline" onClick={() => setPage("forgot-password")}>
          Locked out?
        </button>
      </div>
    </div>
  );
}

function PersonaCard({
  icon: Icon,
  title,
  subtitle,
  selected,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left rounded-2xl border p-5 transition-all focus-ring",
        selected
          ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_40px_-12px_rgba(16,185,129,0.35)]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20",
      )}
    >
      <Icon className={cn("w-8 h-8 mb-3", selected ? "text-emerald-300" : "text-slate-500")} />
      <div className="font-black text-lg text-white">{title}</div>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed">{subtitle}</p>
      {selected && (
        <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
          <Check className="w-4 h-4" /> Selected
        </div>
      )}
    </button>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
  onOpen,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  onOpen?: () => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-4 hover:border-white/15">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 accent-emerald-400 rounded border-line shrink-0"
      />
      <div className="flex-1 min-w-0">
        <label htmlFor={id} className="text-sm text-slate-300 leading-relaxed cursor-pointer block">
          {label}
        </label>
        {onOpen && (
          <button
            type="button"
            className="mt-2 text-xs font-bold text-emerald-400 hover:underline"
            onClick={onOpen}
          >
            View related document →
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/[0.05] pb-2 last:border-0">
      <span className="text-slate-500">{k}</span>
      <span className="text-white font-medium text-right truncate max-w-[55%]">{v}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
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

import { motion } from "framer-motion";
import { ChevronDown, Globe, Loader2, Sprout } from "lucide-react";
import { useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { dbAvailable } from "@/database/client";
import type { AppProfileRow } from "@/database/types";
import type { Page } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { consumeReturnPage } from "@/lib/auth-routes";
import { signUpWithEmail } from "@/services/auth-session.service";
import { useNotificationsStore } from "@/store/notifications.store";

interface SignupPageProps {
  setPage: (p: Page) => void;
}

export function SignupPage({ setPage }: SignupPageProps) {
  const push = useNotificationsStore((s) => s.push);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Exclude<AppProfileRow["role"], "admin">>("investor");
  const [busy, setBusy] = useState(false);

  if (!dbAvailable) {
    return (
      <Glass className="p-10 max-w-lg mx-auto text-center space-y-3">
        <Globe className="w-7 h-7 text-amber-300 mx-auto" />
        <h1 className="font-black text-2xl text-white">Cannot register</h1>
        <p className="text-sm text-slate-400">Provide Supabase environment variables before opening secure accounts.</p>
      </Glass>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-20">
      <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Glass className="p-8 space-y-6 elevated" glow>
          <div className="space-y-1 text-center">
            <Pill color="purple" icon={Sprout}>Create profile</Pill>
            <h1 className="font-black text-3xl text-white tracking-tight mt-4">Claim your ROOTCHAIN workspace</h1>
            <p className="text-sm text-slate-500 mt-2">
              Pick an investor ledger profile or onboard as a cooperative producer — roles gate dashboards appropriately.
            </p>
          </div>

          <div className="space-y-4">
            <Field label="Full legal name" value={fullName} onChange={setFullName} autoComplete="name" />
            <Field label="Professional email" value={email} onChange={setEmail} autoComplete="email" type="email" />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500">Account persona</label>
              <div className="relative mt-2">
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as Exclude<AppProfileRow["role"], "admin">)
                  }
                  className={cn(
                    "w-full bg-black/30 border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus-ring appearance-none pr-10",
                  )}
                >
                  <option value="investor">Investor treasury</option>
                  <option value="farmer">Farmer cooperative</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
              <div className="text-[11px] text-slate-600 mt-2">
                Administrators are minted purely from Supabase tooling — ping platform ops before promoting privileged
                dashboards.
              </div>
            </div>
          </div>

          <Btn
            variant="primary"
            icon={busy ? Loader2 : Sprout}
            fullWidth
            disabled={busy || !fullName.trim() || !email.trim() || password.length < 8}
            onClick={async () => {
              try {
                setBusy(true);
                const { session } = await signUpWithEmail({
                  email,
                  password,
                  fullName: fullName.trim(),
                  role,
                });
                if (session) {
                  push({
                    tone: "success",
                    title: "Workspace live",
                    description: "Profile provisioned · routing back to ROOTCHAIN dashboards.",
                    duration: 5600,
                  });
                  const next = consumeReturnPage("home");
                  setPage(next);
                } else {
                  push({
                    tone: "info",
                    title: "Almost there",
                    description: "Tenant may enforce email confirmations — inbox link unlocks dashboards.",
                    duration: 8200,
                  });
                  setPage("login");
                }
              } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : "Unable to finalize signup.";
                push({ tone: "error", title: "Signup failed", description: msg, duration: 5200 });
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Minting credential…" : "Create secure account"}
          </Btn>

          <div className="text-xs text-center text-slate-500 font-bold space-x-4">
            <button type="button" className="hover:text-white" onClick={() => setPage("login")}>
              ← Existing member
            </button>
            <span className="text-slate-700">|</span>
            <button type="button" className="text-lime-300 hover:text-lime-200 hover:underline" onClick={() => setPage("forgot-password")}>
              Locked out?
            </button>
          </div>
          <Glass className="p-4 bg-black/30 border border-dashed border-white/10">
            <div className="text-[11px] text-slate-500 leading-relaxed">
              <span className="text-violet-200 font-black uppercase tracking-widest">Wallet connect parity</span>{" "}
              Freighter linkage continues to originate transactions — authenticate here to unlock dashboards, escrow
              intelligence, and future compliance rails.
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

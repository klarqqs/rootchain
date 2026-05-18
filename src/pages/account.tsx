import { motion } from "framer-motion";
import {
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
  Loader2,
  LogOut,
  Shield,
  Sprout,
  UserRound,
  Wallet,
  Link2 as LinkIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useMemo, useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import type { Page } from "@/lib/nav";
import { cn, formatUsd, truncateAddr } from "@/lib/utils";
import { useWallet } from "@/hooks/use-wallet";
import { usePortfolio } from "@/hooks/use-portfolio";
import {
  updateAppProfile,
  updatePassword,
  signOutEverywhere,
} from "@/services/auth-session.service";
import type { AppProfileRow } from "@/database/types";
import { useIdentityStore } from "@/store/identity.store";
import { useNotificationsStore } from "@/store/notifications.store";
import type { Investment, PortfolioSnapshot } from "@/types/portfolio";
import type { WalletAccount } from "@/types/wallet";

interface AccountPageProps {
  setPage: (p: Page) => void;
}

export function AccountPage({ setPage }: AccountPageProps) {
  const profile = useIdentityStore((s) => s.profile);
  const recovery = useIdentityStore((s) => s.passwordRecoveryMode);
  const sessionUser = useIdentityStore((s) => s.session?.user);

  const { account, isConnected } = useWallet();
  const { positions, snapshot } = usePortfolio();

  if (!sessionUser) {
    return (
      <Glass className="p-10 max-w-lg mx-auto text-center space-y-4">
        <Shield className="w-8 h-8 text-amber-200 mx-auto" />
        <h1 className="font-black text-2xl text-white">Authenticate first</h1>
        <Btn variant="primary" fullWidth onClick={() => setPage("login")}>
          Go to Sign in
        </Btn>
      </Glass>
    );
  }

  if (!profile) {
    return (
      <Glass className="p-12 max-w-lg mx-auto text-center space-y-4">
        <Loader2 className="w-8 h-8 text-lime-300 mx-auto animate-spin" aria-hidden />
        <h1 className="font-black text-2xl text-white">Hydrating dossier…</h1>
        <p className="text-sm text-slate-500">
          Connecting Supabase governance row keyed to your cryptographic identity UUID.
        </p>
      </Glass>
    );
  }

  return (
    <AccountHydrated
      key={`${profile.id}-${profile.updated_at}`}
      profile={profile}
      sessionUser={sessionUser}
      recovery={recovery}
      positions={positions}
      snapshot={snapshot}
      account={account}
      isConnected={isConnected}
    />
  );
}

interface AccountHydratedProps {
  profile: AppProfileRow;
  sessionUser: User;
  recovery: boolean;
  positions: Investment[];
  snapshot: PortfolioSnapshot;
  account: WalletAccount | null;
  isConnected: boolean;
}

function AccountHydrated({
  profile,
  sessionUser,
  recovery,
  positions,
  snapshot,
  account,
  isConnected,
}: AccountHydratedProps) {
  const push = useNotificationsStore((s) => s.push);
  const [fullName, setFullName] = useState(profile.full_name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [onboardingDone, setOnboardingDone] = useState(profile.onboarding_completed);
  const [savingPatch, setSavingPatch] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  const initials = useMemo(() => {
    const src = profile.full_name.trim() || sessionUser.email || "?";
    return src
      .split(/\s+/g)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  }, [profile.full_name, sessionUser.email]);

  const totalDeployed = snapshot.totalInvested || positions.reduce((s, p) => s + p.amount, 0);

  const persistProfileSlice = async (
    patch: Partial<Omit<AppProfileRow, "id" | "created_at" | "updated_at">>,
  ) => {
    setSavingPatch(true);
    try {
      const merged = await updateAppProfile(profile.id, patch);
      if (merged) {
        useIdentityStore.getState().setAuthSnapshot({ profile: merged });
        push({
          tone: "success",
          title: "Profile refreshed",
          description: "Metadata encrypted at rest behind Supabase RLS.",
          duration: 3600,
        });
      }
      return merged;
    } catch {
      push({ tone: "error", title: "Persist failed", description: "Retry after checking network posture." });
      return null;
    } finally {
      setSavingPatch(false);
    }
  };

  const saveIdentityFields = async () =>
    persistProfileSlice({
      full_name: fullName.trim(),
      avatar_url: avatarUrl.trim() || null,
      onboarding_completed: onboardingDone,
    });

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-20">
      <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}>
        <Glass className="p-8 space-y-4 elevated" glow>
          <div className="flex flex-wrap items-start gap-4 justify-between">
            <div className="space-y-2">
              <Pill color="lime" icon={UserRound}>{profile.role.toUpperCase()} · Sovereign workspace</Pill>
              <h1 className="font-black text-3xl tracking-tight text-white">Trusted identity dossier</h1>
              <p className="text-sm text-slate-500 max-w-xl">{sessionUser.email}</p>
            </div>
            <div
              className="w-16 h-16 rounded-3xl bg-gradient-to-br from-lime-400/70 to-teal-500/70 border border-white/20 flex items-center justify-center font-black text-2xl text-black shadow-xl"
              aria-hidden
            >
              {initials || "?"}
            </div>
          </div>
          <Glass className="p-5 grid sm:grid-cols-3 gap-4 bg-black/25 border-white/10">
            <MiniStat icon={CircleDollarSign} label="Live allocation" value={formatUsd(totalDeployed)} />
            <MiniStat icon={Sprout} label="Harvest lines" value={String(positions.length)} />
            <MiniStat icon={BadgeCheck} label="Verification" value={(profile.farmer_verification_status ?? "pending").toUpperCase()} />
          </Glass>
          {recovery && (
            <Glass className="p-5 space-y-3 border border-amber-500/35 bg-amber-500/[0.04]">
              <div className="text-xs font-black uppercase tracking-widest text-amber-300">Privileged recovery handshake</div>
              <input
                type="password"
                placeholder="New password · min 8 chars"
                className={cn(fieldClass)}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm password"
                className={cn(fieldClass)}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
              <Btn
                variant="primary"
                fullWidth
                icon={pwBusy ? Loader2 : CheckCircle2}
                disabled={pwBusy || newPw.length < 8 || newPw !== confirmPw}
                onClick={async () => {
                  try {
                    setPwBusy(true);
                    await updatePassword(newPw);
                    useIdentityStore.getState().setAuthSnapshot({ passwordRecoveryMode: false });
                    push({
                      tone: "success",
                      title: "Password rotated",
                      description: "JWT re-issued · prior refresh tokens invalidated.",
                      duration: 4600,
                    });
                    setNewPw("");
                    setConfirmPw("");
                  } catch (e: unknown) {
                    const msg = e instanceof Error ? e.message : "Rotation failed.";
                    push({ tone: "error", title: "Denied", description: msg, duration: 5200 });
                  } finally {
                    setPwBusy(false);
                  }
                }}
              >
                Seal new passphrase
              </Btn>
            </Glass>
          )}

          <div className="grid md:grid-cols-2 gap-4 pt-4">
            <div>
              <label className={labelCls}>Displayed name</label>
              <input className={fieldClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Avatar URL</label>
              <input className={fieldClass} value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="HTTPS portrait" />
            </div>
            <label className="flex items-center gap-2 text-[11px] font-bold uppercase text-slate-500 cursor-pointer mt-8 md:mt-14">
              <input
                type="checkbox"
                className="accent-lime-400 rounded border-line"
                checked={onboardingDone}
                onChange={(e) => setOnboardingDone(e.target.checked)}
              />
              Onboarding playbook completed
            </label>
          </div>

          <div className="flex flex-wrap gap-3 pt-6">
            <Btn
              variant="primary"
              icon={savingPatch ? Loader2 : CheckCircle2}
              disabled={
                savingPatch ||
                (fullName === profile.full_name && avatarUrl === (profile.avatar_url ?? "") && onboardingDone === profile.onboarding_completed)
              }
              onClick={saveIdentityFields}
            >
              {savingPatch ? "Marshalling…" : "Save dossier"}
            </Btn>
            <Btn variant="outline" icon={Wallet} disabled={!isConnected || !account} onClick={() => persistProfileSlice({ wallet_public_key: account!.publicKey })}>
              Anchor connected wallet ({isConnected ? truncateAddr(account!.publicKey, 5, 4) : "—"})
            </Btn>
          </div>
        </Glass>
      </motion.div>

      <Glass className="p-8 space-y-4">
        <Pill color="purple" icon={LinkIcon}>Wallet & custody posture</Pill>
        <p className="text-sm text-slate-400">
          Profiles never custody private keys · only public Stellar anchors are mirrored for reconciliation with your
          on-chain treasury.
        </p>
      </Glass>

      <Glass className="p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-300" />
          <div className="font-black text-xl text-white">Investment ledger (local deterministic seed)</div>
        </div>
        <div className="divide-y divide-white/[0.04] rounded-2xl border border-line overflow-hidden bg-black/20">
          {positions.length === 0 ? (
            <div className="p-6 text-sm text-slate-400">Awaiting financed harvests · explore marketplace for allocation ideas.</div>
          ) : (
            positions.slice(0, 6).map((p) => (
              <div key={p.id} className="p-4 flex flex-wrap gap-4 items-center justify-between text-sm">
                <div className="text-white font-black">{p.produceName}</div>
                <div className="tabular-nums text-lime-200 font-bold">{formatUsd(p.amount)}</div>
                <div className="text-[11px] font-bold uppercase text-slate-500">{p.status}</div>
              </div>
            ))
          )}
        </div>
        <Btn variant="danger" fullWidth icon={LogOut} onClick={() => signOutEverywhere()}>
          Global sign-out · terminates refresh tokens everywhere
        </Btn>
      </Glass>
    </div>
  );
}

const labelCls = "text-[11px] font-bold uppercase text-slate-500";
const fieldClass =
  "mt-2 w-full bg-black/30 border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus-ring";

function MiniStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="text-lg font-black text-white tabular-nums">{value}</div>
    </div>
  );
}

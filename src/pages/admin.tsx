import { useMemo, useState } from "react";
import { KeyRound, Lock, ShieldHalf, ToggleLeft } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Btn } from "@/components/ui/button";
import { publicEnv } from "@/lib/env";
import { isSupabaseAuthEnforced } from "@/lib/auth-routes";
import { SEED_FARMERS } from "@/database/seed-farmers";
import { useAdminFarmerFlagsStore } from "@/store/admin-farmer-flags.store";
import { useFarmerApplicationsStore } from "@/store/farmer-applications.store";
import { usePortfolioStore } from "@/store/portfolio.store";
import { useIdentityStore } from "@/store/identity.store";
import { computePlatformTransparency } from "@/transparency/platform-metrics";
import { formatUsd } from "@/lib/utils";
import { signOutEverywhere } from "@/services/auth-session.service";

const STORAGE_KEY = "rootchain_admin_ok";

export function AdminPage() {
  const profile = useIdentityStore((s) => s.profile);
  const sessionUser = useIdentityStore((s) => s.session?.user);
  const platform = computePlatformTransparency();
  const positions = usePortfolioStore((s) => s.positions);
  const [token, setToken] = useState("");
  const [tokenGate, setTokenGate] = useState(() => sessionStorage.getItem(STORAGE_KEY) === "1");
  const identityAdminGate = Boolean(
    isSupabaseAuthEnforced() && profile?.role === "admin" && sessionUser,
  );
  const unlocked = identityAdminGate || (publicEnv.adminTokenConfigured && tokenGate);
  const expected = import.meta.env.VITE_ADMIN_TOKEN as string | undefined;
  const applications = useFarmerApplicationsStore((s) => s.items);
  const overrides = useAdminFarmerFlagsStore((s) => s.overrides);
  const setVerified = useAdminFarmerFlagsStore((s) => s.setVerified);
  const escrowLocked = positions.reduce((s, p) => {
    const released = p.escrowReleasedPct ?? 0;
    return s + p.amount * (1 - released / 100);
  }, 0);

  const blendedReleased =
    positions.length === 0
      ? 0
      : positions.reduce((s, p) => s + (p.escrowReleasedPct ?? 0), 0) / positions.length;

  const rows = useMemo(
    () =>
      SEED_FARMERS.map((f) => {
        const ov = overrides[f.id];
        return {
          ...f,
          verified: ov?.verified ?? f.verified,
        };
      }),
    [overrides],
  );

  if (!publicEnv.adminTokenConfigured && !identityAdminGate) {
    return (
      <Glass className="p-8 max-w-xl mx-auto text-center space-y-3">
        <Lock className="w-6 h-6 text-amber-300 mx-auto" />
        <h1 className="font-black text-2xl text-white">Admin console locked</h1>
        <p className="text-sm text-slate-400">
          Set <code className="text-lime-200">VITE_ADMIN_TOKEN</code> for the legacy operator gate, or promote an
          operator via <code className="text-lime-200">app_profiles.role = &apos;admin&apos;</code> when{" "}
          <code className="text-lime-200">VITE_SUPABASE_AUTH=true</code>.
        </p>
      </Glass>
    );
  }

  if (!unlocked) {
    return (
      <Glass className="p-8 max-w-md mx-auto space-y-4 elevated" glow>
        <Pill color="purple" icon={KeyRound}>Operator login</Pill>
        <h1 className="font-black text-2xl text-white">Authenticate</h1>
        <p className="text-xs text-slate-500">Session-only acknowledgement — migrate to SSO + MFA for regulated ops.</p>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full bg-black/40 border border-line rounded-xl px-3 py-2 text-sm outline-none focus-ring"
          placeholder="Admin token"
        />
        <Btn
          variant="primary"
          fullWidth
          onClick={() => {
            if (!expected || token !== expected) return;
            sessionStorage.setItem(STORAGE_KEY, "1");
            setTokenGate(true);
            setToken("");
          }}
        >
          Unlock console
        </Btn>
      </Glass>
    );
  }

  return (
    <div className="space-y-5 pb-16">
      <Glass className="p-6 flex flex-wrap items-center gap-4 justify-between">
        <div className="space-y-1">
          <Pill color="lime" icon={ShieldHalf}>Operational brief</Pill>
          <div className="font-black text-2xl text-white tracking-tight">Escrow + farmer oversight</div>
          <div className="text-xs text-slate-500">
            Transparency rail · {platform.liveListings} listings · {platform.avgFundingProgressPct.toFixed(1)}% avg fill.
          </div>
        </div>
        <Btn
          variant="ghost"
          onClick={() => {
            if (identityAdminGate) void signOutEverywhere();
            else {
              sessionStorage.removeItem(STORAGE_KEY);
              setTokenGate(false);
            }
          }}
        >
          {identityAdminGate ? "Sign out (Supabase)" : "Lock console"}
        </Btn>
      </Glass>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Outstanding escrow (model)" value={formatUsd(escrowLocked)} />
        <Stat label="Milestone disbursement" value={`${blendedReleased.toFixed(1)}%`} />
        <Stat label="Open positions" value={String(positions.length)} />
        <Stat label="Investor exposures" value={platform.activeInvestorAccounts.toLocaleString()} />
      </div>

      <Glass className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-black text-lg text-white tracking-tight">Farmer attestations</div>
            <div className="text-xs text-slate-500">Flags persist locally · Supabase approvals come next.</div>
          </div>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {rows.map((farmer) => (
            <div
              key={farmer.id}
              className="flex flex-wrap gap-4 items-center justify-between rounded-2xl border border-white/[0.04] px-4 py-3"
            >
              <div className="min-w-0">
                <div className="font-bold text-white truncate">{farmer.name}</div>
                <div className="text-[11px] text-slate-500">{farmer.farm_name}</div>
              </div>
              <div className="flex gap-2">
                <ToggleLeft className={`w-4 h-4 ${farmer.verified ? "text-lime-300" : "text-slate-500"}`} />
                <button
                  type="button"
                  onClick={() => setVerified(farmer.id, !farmer.verified)}
                  className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border border-white/10 hover:border-lime-400"
                >
                  {farmer.verified ? "Revoke badge" : "Verify farmer"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Glass>

      <Glass className="p-6 space-y-3">
        <div className="font-black text-lg text-white tracking-tight">Farmer registration queue · {applications.length}</div>
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {applications.length === 0 && (
            <div className="text-xs text-slate-500 italic">Awaiting Cooperative submissions…</div>
          )}
          {applications.map((row) => (
            <div key={row.id} className="rounded-2xl border border-white/[0.04] px-4 py-3 text-sm text-slate-300">
              <div className="font-bold text-white">{row.fullName}</div>
              <div className="text-xs text-lime-200">{row.farmName}</div>
              <div className="text-[11px] text-slate-500">{row.email}</div>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Glass className="p-4 space-y-1">
      <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{label}</div>
      <div className="font-black text-xl text-white tabular-nums">{value}</div>
    </Glass>
  );
}

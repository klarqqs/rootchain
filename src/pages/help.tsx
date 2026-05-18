import { useMemo, useState } from "react";
import { ChevronDown, Cpu, Shield, Sparkles } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Btn } from "@/components/ui/button";
import type { Page } from "@/lib/nav";
import { useNotificationPrefsStore } from "@/store/notification-prefs.store";
import { useOnboardingStore } from "@/store/onboarding.store";
import { requestDesktopNotificationPermission } from "@/services/notification-delivery.service";

const FAQ_ITEMS = [
  {
    q: "Is this mainnet?",
    a: "No. ROOTCHAIN runs on Stellar testnet for hackathon and accelerator demos. Custody rails on mainnet require legal + custody partners.",
  },
  {
    q: "Where do deposits go?",
    a: "When Freighter executes a transfer, escrow receives test XLM equivalents. Investor ownership is mirrored in your portfolio + optional Supabase indexing.",
  },
  {
    q: "Are returns guaranteed?",
    a: "No. Projections are illustrative. Always treat demo environments as simulations until independent audits publish.",
  },
  {
    q: "How do escalations work?",
    a: "Use the Farmer intake form for registration. Operators can track submissions in Admin Console once VITE_ADMIN_TOKEN is configured.",
  },
];

export function HelpPage({ setPage }: { setPage: (page: Page) => void }) {
  const desktop = useNotificationPrefsStore((s) => s.desktop);
  const emailStub = useNotificationPrefsStore((s) => s.emailStub);
  const muteInvest = useNotificationPrefsStore((s) => s.muteInvest);
  const muteEscrow = useNotificationPrefsStore((s) => s.muteEscrow);
  const setDesktop = useNotificationPrefsStore((s) => s.setDesktop);
  const setEmailStub = useNotificationPrefsStore((s) => s.setEmailStub);
  const setMuteInvest = useNotificationPrefsStore((s) => s.setMuteInvest);
  const setMuteEscrow = useNotificationPrefsStore((s) => s.setMuteEscrow);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const [openIx, setOpenIx] = useState<number | null>(0);

  const faqStructured = useMemo(() => FAQ_ITEMS, []);

  return (
    <div className="space-y-5 pb-16">
      <Glass className="p-6">
        <Pill color="purple" icon={Sparkles}>Investor enablement desk</Pill>
        <h1 className="font-black text-3xl text-white mt-4 tracking-tight">Help Center</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          Everything here supports demo-day storytelling. Production ROOTCHAIN swaps these flows for regulated onboarding and live service desks.
        </p>
      </Glass>

      <Glass className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-lime-300" />
          <h2 className="font-black text-lg text-white tracking-tight">Notifications & pacing</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-300">
          <label className="flex items-start gap-3 rounded-2xl border border-white/[0.06] p-3">
            <input type="checkbox" checked={desktop} onChange={(e) => void setDesktop(e.target.checked)} className="mt-1" />
            <div>
              <div className="font-bold text-white">Desktop pushes</div>
              <div className="text-xs text-slate-500">Mirrors escrow + payout alerts when permission granted.</div>
            </div>
          </label>
          <label className="flex items-start gap-3 rounded-2xl border border-white/[0.06] p-3">
            <input type="checkbox" checked={emailStub} onChange={(e) => void setEmailStub(e.target.checked)} className="mt-1" />
            <div>
              <div className="font-bold text-white">Email queue (stub)</div>
              <div className="text-xs text-slate-500">Logs structured payloads in development — swap for Supabase Functions.</div>
            </div>
          </label>
          <label className="flex items-start gap-3 rounded-2xl border border-white/[0.06] p-3">
            <input type="checkbox" checked={muteInvest} onChange={(e) => void setMuteInvest(e.target.checked)} className="mt-1" />
            <div>
              <div className="font-bold text-white">Mute invests</div>
              <div className="text-xs text-slate-500">Keeps kiosk mode quiet during live presentations.</div>
            </div>
          </label>
          <label className="flex items-start gap-3 rounded-2xl border border-white/[0.06] p-3">
            <input type="checkbox" checked={muteEscrow} onChange={(e) => void setMuteEscrow(e.target.checked)} className="mt-1" />
            <div>
              <div className="font-bold text-white">Mute escrow pings</div>
              <div className="text-xs text-slate-500">Great for scripted investor walkthroughs.</div>
            </div>
          </label>
        </div>
        <Btn
          variant="outline"
          className="mt-4"
          onClick={() => void requestDesktopNotificationPermission().then((perm) => {
            if (perm === "granted") void setDesktop(true);
          })}
        >
          Request browser permission
        </Btn>
      </Glass>

      <Glass className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <div className="font-black text-lg text-white tracking-tight">FAQ</div>
            <div className="text-xs text-slate-500">Curated investor + farmer FAQs</div>
          </div>
          <Btn variant="ghost" size="sm" onClick={() => resetOnboarding()}>
            Replay guided setup
          </Btn>
        </div>
        <div className="space-y-2">
          {faqStructured.map((row, ix) => {
            const expanded = openIx === ix;
            return (
              <button
                type="button"
                key={row.q}
                onClick={() => setOpenIx(expanded ? null : ix)}
                className="w-full text-left rounded-2xl border border-white/[0.06] bg-black/20 hover:border-lime-500/40 transition px-4 py-3"
              >
                <div className="flex justify-between gap-3 font-bold text-white text-sm">
                  {row.q}
                  <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition ${expanded ? "rotate-180" : ""}`} />
                </div>
                {expanded && <p className="text-xs text-slate-400 mt-2 leading-relaxed">{row.a}</p>}
              </button>
            );
          })}
        </div>
      </Glass>

      <Glass className="p-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-300" />
          <div className="text-sm font-bold text-white">Operator resources</div>
        </div>
        <Btn variant="outline" size="sm" onClick={() => setPage("admin")}>Open admin console</Btn>
        <Btn variant="ghost" size="sm" onClick={() => setPage("register")}>Farmer onboarding form</Btn>
      </Glass>
    </div>
  );
}

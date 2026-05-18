import { useMemo, useState } from "react";
import { Rocket } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { usePilotWaitlistStore } from "@/store/pilot-waitlist.store";
import { useNotificationsStore } from "@/store/notifications.store";

export function PilotLaunchPage() {
  const [email, setEmail] = useState("");
  const join = usePilotWaitlistStore((s) => s.joinWaitlist);
  const pilots = usePilotWaitlistStore((s) => s.subscribers.length);
  const push = useNotificationsStore((s) => s.push);

  const summary = useMemo(
    () => [
      {
        label: "Native roadmap",
        copy: "React Native / Flutter wrapper can mirror wallet session + escrow alerts without replacing this web stack.",
      },
      {
        label: "Accelerator mode",
        copy: 'Enable VITE_SHOWCASE_MODE for investor rooms while keeping escrow telemetry visible in dashboards.',
      },
      {
        label: "Staging discipline",
        copy: 'Run parallel VITE_APP_ENV=staging builds for cooperative pilots ahead of flipping mainnet routing flags.',
      },
    ],
    [],
  );

  const submit = () => {
    const r = join(email.trim());
    if (r === "invalid") {
      push({ tone: "warning", title: "Needs a valid email", duration: 4000 });
      return;
    }
    if (r === "duplicate") {
      push({ tone: "info", title: "Already enlisted", duration: 4000 });
      return;
    }
    push({
      tone: "success",
      title: "Waitlist saved locally",
      description: "Backed by Indexed storage — wire Supabase ingest when pilots open.",
      duration: 5200,
    });
    setEmail("");
  };

  return (
    <div className="space-y-5 pb-16 max-w-3xl mx-auto">
      <Glass className="p-6 elevated" glow>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Pill color="lime" icon={Rocket}>
            Phase 6 · launch runway
          </Pill>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {pilots.toLocaleString()} early signals tracked (local persistence)
          </span>
        </div>
        <h2 className="font-black text-3xl text-white tracking-tight">
          Invite cooperatives · queue investors · sequence pilots.
        </h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          This waitlist persists in-browser until your Supabase project ingests it. Tie it into operator console exports when field teams finalize intake.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@foundation.org"
            className="flex-1 px-4 py-2.5 rounded-xl border border-line bg-black/35 text-white text-sm outline-none focus-ring"
          />
          <Btn variant="primary" icon={Rocket} onClick={submit} className="min-h-[44px] shrink-0">
            Join pilots
          </Btn>
        </div>
      </Glass>

      <div className="grid sm:grid-cols-3 gap-3">
        {summary.map((s) => (
          <Glass key={s.label} className="p-4 space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-lime-200">{s.label}</div>
            <p className="text-xs text-slate-400 leading-relaxed">{s.copy}</p>
          </Glass>
        ))}
      </div>
    </div>
  );
}

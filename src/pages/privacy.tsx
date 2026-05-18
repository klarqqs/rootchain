import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";

export function PrivacyPage() {
  return (
    <div className="space-y-5 pb-16 max-w-3xl mx-auto">
      <Glass className="p-6 space-y-3">
        <Pill color="ash">Privacy posture</Pill>
        <h1 className="font-black text-3xl text-white tracking-tight">Privacy policy (prototype)</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          ROOTCHAIN is a front-end-first demo. Wallet addresses, transaction hashes, and any Supabase payloads you optionally configure are treated as confidential product telemetry. Production deployments must embed regional compliance (GDPR, NDPR, etc.) reviewed by counsel.
        </p>
      </Glass>
      <Glass className="p-6 space-y-4 text-sm text-slate-300 leading-relaxed">
        <Section title="Collection" body="Public Stellar addresses, voluntarily submitted farmer intake fields, onboarding preferences, notification toggles." />
        <Section title="Storage" body="Local indexing via localStorage and optional Supabase with row-level policies you control outside this repo." />
        <Section title="Retention" body="Demonstration data may reset at any time. Production retention schedules belong in operational runbooks." />
        <Section title="Contacts" body="Security questions should route through your organization's responsible disclosure workflow — not anonymous forms." />
      </Glass>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="font-black text-white mb-2">{title}</div>
      <div className="text-slate-400">{body}</div>
    </div>
  );
}

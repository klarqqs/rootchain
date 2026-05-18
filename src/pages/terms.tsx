import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";

export function TermsPage() {
  return (
    <div className="space-y-5 pb-16 max-w-3xl mx-auto">
      <Glass className="p-6 space-y-3">
        <Pill color="lime">Responsible use</Pill>
        <h1 className="font-black text-3xl text-white tracking-tight">Terms of service (prototype)</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          By navigating this build you acknowledge ROOTCHAIN references are illustrative, escrow rails are simulated, and no fiduciary relationship exists.
        </p>
      </Glass>
      <Glass className="p-6 space-y-4 text-sm text-slate-300 leading-relaxed">
        <Section title="Investment disclaimer" body="Nothing here constitutes securities advice. Tokenized harvesting requires jurisdictional filings before public solicitation." />
        <Section title="Testnet reliance" body="Transfers move test assets only — treat accounts as ephemeral." />
        <Section title="Liability caps" body="Maintain separate incident response + insurance processes before assuming operational liability for farmers or LPs." />
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

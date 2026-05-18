import { useState } from "react";
import { Send, Wheat } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Btn } from "@/components/ui/button";
import { useFarmerApplicationsStore } from "@/store/farmer-applications.store";
import { cn } from "@/lib/utils";

export function FarmerRegisterPage() {
  const submit = useFarmerApplicationsStore((s) => s.submit);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [farmName, setFarmName] = useState("");
  const [region, setRegion] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [stellarHint, setStellarHint] = useState("");
  const [notes, setNotes] = useState("");
  const [docs, setDocs] = useState<File[]>([]);
  const [done, setDone] = useState(false);

  return (
    <div className="space-y-5 pb-16 max-w-2xl mx-auto">
      <Glass className="p-6 space-y-2">
        <Pill color="lime" icon={Wheat}>Farmer onboarding</Pill>
        <h1 className="font-black text-3xl text-white tracking-tight">Register your cooperative</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Submissions stay in local storage until you wire Supabase + storage buckets. Operators review via Admin Console.
        </p>
      </Glass>
      {!done ? (
        <Glass className="p-6 space-y-4" elevated>
          <Field label="Full name" value={name} onChange={setName} />
          <Field label="Lead email" value={email} onChange={setEmail} />
          <Field label="Farm / cooperative legal name" value={farmName} onChange={setFarmName} />
          <Field label="Region" value={region} onChange={setRegion} />
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500">Specialties</label>
            <textarea
              rows={3}
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              className="mt-2 w-full bg-black/30 border border-line rounded-xl px-3 py-2 text-sm outline-none focus-ring"
              placeholder="Cocoa traceability, aqua IoT telemetry, pasture rotation..."
            />
          </div>
          <Field label="Preferred Stellar address (optional preview)" value={stellarHint} onChange={setStellarHint} mono />
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500">Supporting media</label>
            <label className="mt-2 block cursor-pointer rounded-xl border border-dashed border-white/15 bg-black/40 px-4 py-10 text-center text-xs text-slate-400 hover:border-lime-400/60">
              <span className="font-bold text-lime-200">Browse files · photos, PDF attestations</span>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*,application/pdf"
                onChange={(e) => setDocs(Array.from(e.target.files ?? []))}
              />
            </label>
            {docs.length > 0 && (
              <ul className="mt-3 text-[11px] text-slate-400 space-y-1">
                {docs.map((d) => (
                  <li key={d.name} className="flex justify-between gap-2 border border-white/[0.04] px-3 py-1 rounded-lg">
                    <span>{d.name}</span>
                    <span className="tabular-nums">{(d.size / 1024).toFixed(1)} KB</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 w-full bg-black/30 border border-line rounded-xl px-3 py-2 text-sm outline-none focus-ring"
              placeholder="What milestones can your farm verify digitally today?"
            />
          </div>
          <Btn
            variant="primary"
            icon={Send}
            fullWidth
            onClick={() => {
              submit({
                fullName: name,
                email,
                farmName,
                region,
                specialties,
                stellarHint: stellarHint || undefined,
                notes: notes || undefined,
              });
              setDone(true);
            }}
            disabled={!name.trim() || !email.trim() || !farmName.trim()}
          >
            Submit registration
          </Btn>
          <div className="text-[11px] text-slate-500 text-center">Upload payloads stay client-side previews — persist with Supabase Storage for production audits.</div>
        </Glass>
      ) : (
        <Glass className="p-10 text-center space-y-2">
          <div className="font-black text-2xl text-white">Submission received ✅</div>
          <div className="text-sm text-slate-400">We'll sync this view with Supabase + Service Desk once credentials land.</div>
          <Btn variant="ghost" onClick={() => setDone(false)}>
            Submit another coop
          </Btn>
        </Glass>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase text-slate-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "mt-2 w-full bg-black/30 border border-line rounded-xl px-3 py-2 text-sm outline-none focus-ring",
          mono && "font-mono text-xs",
        )}
      />
    </div>
  );
}

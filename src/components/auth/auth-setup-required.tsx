import { ExternalLink, Globe, KeyRound } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { supabaseSetupHint } from "@/lib/supabase-env";
import type { Page } from "@/lib/nav";

export interface AuthSetupRequiredProps {
  title?: string;
  setPage?: (p: Page) => void;
}

export function AuthSetupRequired({
  title = "Authentication not configured",
  setPage,
}: AuthSetupRequiredProps) {
  const hint = supabaseSetupHint();

  return (
    <Glass className="p-8 sm:p-10 max-w-xl mx-auto space-y-6 text-center elevated border-amber-500/15">
      <Globe className="w-8 h-8 text-amber-300 mx-auto" />
      <div className="space-y-2">
        <h1 className="font-black text-2xl text-white tracking-tight">{title}</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          ROOTCHAIN accounts run on Supabase Auth. The app cannot register or sign in until your local{" "}
          <code className="text-lime-200">.env</code> has a real project URL and anon key.
        </p>
        {hint ? <p className="text-xs text-amber-200/90 font-medium">{hint}</p> : null}
      </div>

      <ol className="text-left text-sm text-slate-400 space-y-3 list-decimal list-inside">
        <li>
          Create a project at{" "}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer noopener"
            className="text-emerald-400 font-bold hover:underline"
          >
            supabase.com/dashboard
          </a>
        </li>
        <li>
          Copy <span className="text-slate-300">Project URL</span> and{" "}
          <span className="text-slate-300">anon public</span> key into <code className="text-lime-200">.env</code>
        </li>
        <li>
          Run SQL in <code className="text-lime-200">supabase/migrations/001_app_profiles.sql</code>
        </li>
        <li>
          Enable Email OTP + SMTP — see <code className="text-lime-200">supabase/AUTH_EMAIL_OTP.md</code>
        </li>
        <li>Restart <code className="text-lime-200">npm run dev</code></li>
      </ol>

      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Btn
          variant="outline"
          icon={ExternalLink}
          onClick={() => window.open("https://supabase.com/dashboard/project/_/settings/api", "_blank")}
        >
          Open Supabase API settings
        </Btn>
        {setPage && (
          <Btn variant="ghost" onClick={() => setPage("home")}>
            Back to home
          </Btn>
        )}
      </div>

      <p className="text-[11px] text-slate-600 flex items-center justify-center gap-2">
        <KeyRound className="w-3.5 h-3.5" />
        Never commit <code className="text-slate-500">.env</code> — only <code className="text-slate-500">.env.example</code> is tracked.
      </p>
    </Glass>
  );
}

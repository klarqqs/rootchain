import { ExternalLink, Globe, KeyRound, Server } from "lucide-react";
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
          ROOTCHAIN needs a backend for accounts and marketplace data. Configure either the{" "}
          <strong className="text-white font-bold">Railway API</strong> (recommended) or{" "}
          <strong className="text-white font-bold">Supabase</strong> in your local{" "}
          <code className="text-lime-200">.env</code>.
        </p>
        {hint ? <p className="text-xs text-amber-200/90 font-medium">{hint}</p> : null}
      </div>

      <div className="text-left space-y-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-2">
            <Server className="w-4 h-4" />
            Railway API (JWT + PostgreSQL)
          </p>
          <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
            <li>
              <code className="text-lime-200">cd server && cp .env.example .env</code> — set{" "}
              <code className="text-lime-200">DATABASE_URL</code> and JWT secrets
            </li>
            <li>
              <code className="text-lime-200">npm install && npx prisma migrate dev && npm run db:seed</code>
            </li>
            <li>
              <code className="text-lime-200">npm run dev</code> in <code className="text-lime-200">server/</code> (port 3001)
            </li>
            <li>
              In root <code className="text-lime-200">.env</code>:{" "}
              <code className="text-lime-200">VITE_API_URL=http://localhost:3001/api/v1</code>
            </li>
          </ol>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Legacy: Supabase</p>
          <ol className="text-sm text-slate-500 space-y-2 list-decimal list-inside">
            <li>Project URL + anon key in <code className="text-lime-200">.env</code></li>
            <li>Run SQL under <code className="text-lime-200">supabase/migrations/</code></li>
            <li>See <code className="text-lime-200">supabase/AUTH_EMAIL_OTP.md</code></li>
          </ol>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Btn
          variant="outline"
          icon={ExternalLink}
          onClick={() => window.open("https://railway.app", "_blank")}
        >
          Railway dashboard
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

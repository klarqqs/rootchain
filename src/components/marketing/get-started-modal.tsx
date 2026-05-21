import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Landmark, Tractor, X } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import type { Page } from "@/lib/nav";
import { stashSignupPersonaRole } from "@/lib/signup-intent";
import { cn } from "@/lib/utils";

export interface GetStartedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setPage: (p: Page) => void;
}

export function GetStartedModal({ open, onOpenChange, setPage }: GetStartedModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const choose = (role: "investor" | "farmer") => {
    stashSignupPersonaRole(role);
    onOpenChange(false);
    setPage("signup");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="get-started-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="relative w-full max-w-lg"
          >
            <Glass className="p-6 sm:p-8 border-white/[0.08] shadow-[0_0_60px_-12px_rgba(16,185,129,0.35)]">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-400/90 mb-2">
                    Create account
                  </p>
                  <h2 id="get-started-title" className="font-black text-2xl sm:text-3xl text-white tracking-tight">
                    How do you want to join?
                  </h2>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    You will complete a short verification-style signup. Pick the path that matches you — you can
                    always talk to support if you are unsure.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05] shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => choose("investor")}
                  className={cn(
                    "text-left rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5",
                    "hover:border-emerald-500/35 hover:bg-emerald-500/[0.06] transition-colors group",
                  )}
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-3 border border-emerald-500/20">
                    <Landmark className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="font-black text-white text-lg">Investor</div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Back harvest programs, follow milestones, and settle in USDC on Stellar.
                  </p>
                  <span className="mt-4 inline-block text-xs font-bold text-emerald-400 group-hover:underline">
                    Continue as investor →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => choose("farmer")}
                  className={cn(
                    "text-left rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5",
                    "hover:border-amber-400/30 hover:bg-amber-500/[0.05] transition-colors group",
                  )}
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-500/12 flex items-center justify-center mb-3 border border-amber-400/20">
                    <Tractor className="w-5 h-5 text-amber-200/90" />
                  </div>
                  <div className="font-black text-white text-lg">Farmer</div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Register your cooperative or farm profile for listings and milestone-based funding.
                  </p>
                  <span className="mt-4 inline-block text-xs font-bold text-amber-200/90 group-hover:underline">
                    Continue as farmer →
                  </span>
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-600 text-center sm:text-left">
                  Already have an account?{" "}
                  <button type="button" className="text-emerald-400 font-bold hover:underline" onClick={() => { onOpenChange(false); setPage("login"); }}>
                    Log in
                  </button>
                </p>
                <Btn variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                  Cancel
                </Btn>
              </div>
            </Glass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

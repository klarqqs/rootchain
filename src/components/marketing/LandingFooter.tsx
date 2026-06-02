import { Sprout } from "lucide-react";
import type { Page } from "@/lib/nav";

export interface LandingFooterProps {
  setPage: (p: Page) => void;
  requestGetStarted?: () => void;
  authEnforced?: boolean;
}

const link = "text-sm text-slate-500 hover:text-emerald-300/90 transition-colors";

export function LandingFooter({ setPage, requestGetStarted, authEnforced }: LandingFooterProps) {
  return (
    <footer
      className="border-t border-white/[0.06] mt-auto"
      style={{
        background: "linear-gradient(180deg, rgba(8,12,10,0.4) 0%, rgba(3,5,4,0.95) 100%)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #059669 0%, #022c22 100%)",
                  boxShadow: "0 0 20px rgba(16,185,129,0.2)",
                }}
              >
                <Sprout className="w-4 h-4 text-amber-200/90" strokeWidth={2.5} />
              </div>
              <span className="font-black text-white tracking-tight">ROOTCHAIN</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Transparent agricultural finance on Stellar — connecting verified farms with global capital.
            </p>
          </div>

          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-600 mb-4">Platform</div>
            <ul className="space-y-3">
              <li>
                <button type="button" className={link} onClick={() => setPage("farmers")}>
                  Farms
                </button>
              </li>
              <li>
                <button type="button" className={link} onClick={() => setPage("marketplace")}>
                  Marketplace
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={link}
                  onClick={() =>
                    requestGetStarted
                      ? requestGetStarted()
                      : authEnforced
                        ? setPage("signup")
                        : setPage("marketplace")
                  }
                >
                  Investors
                </button>
              </li>
              <li>
                <button type="button" className={link} onClick={() => setPage("dashboard")}>
                  Dashboard
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-600 mb-4">Company</div>
            <ul className="space-y-3">
              <li>
                <button type="button" className={link} onClick={() => setPage("about")}>
                  About
                </button>
              </li>
              <li>
                <button type="button" className={link} onClick={() => setPage("community")}>
                  Community
                </button>
              </li>
              <li>
                <button type="button" className={link} onClick={() => setPage("launch")}>
                  Careers / Launch
                </button>
              </li>
              <li>
                <button type="button" className={link} onClick={() => setPage("help")}>
                  Contact &amp; FAQ
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-600 mb-4">Legal</div>
            <ul className="space-y-3">
              <li>
                <button type="button" className={link} onClick={() => setPage("compliance")}>
                  Compliance
                </button>
              </li>
              <li>
                <button type="button" className={link} onClick={() => setPage("compliance")}>
                  Risk disclosure
                </button>
              </li>
              <li>
                <button type="button" className={link} onClick={() => setPage("privacy")}>
                  Privacy
                </button>
              </li>
              <li>
                <button type="button" className={link} onClick={() => setPage("terms")}>
                  Terms
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600 text-center sm:text-left">
            © {new Date().getFullYear()} RootChain. All rights reserved.
          </p>
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
            Built on Stellar blockchain
          </p>
        </div>
      </div>
    </footer>
  );
}

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Sprout, Store, Wallet, X } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { cn, truncateAddr } from "@/lib/utils";
import type { Page } from "@/lib/nav";
import { useWallet } from "@/hooks/use-wallet";
import { walletConnectRequiresAccount } from "@/lib/platform-mode";
import type { LandingHomeSectionId } from "@/lib/landing-section-ids";
import { useLandingHomeScroll } from "@/components/marketing/landing-home-scroll-context";

export interface LandingNavProps {
  page: Page;
  setPage: (p: Page) => void;
  onConnectWallet: () => void;
  /** Opens persona chooser (investor vs farmer) before signup. */
  requestGetStarted: () => void;
  signedIn: boolean;
}

type NavKey = "platform" | "community" | "how" | "faq";

const NAV: { key: NavKey; label: string; section: LandingHomeSectionId }[] = [
  { key: "platform", label: "Platform", section: "platform" },
  { key: "community", label: "Community", section: "community" },
  { key: "how", label: "How it works", section: "how-it-works" },
  { key: "faq", label: "FAQ", section: "landing-faq" },
];

function scrollToSection(id: string) {
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export function LandingNav({ page, setPage, onConnectWallet, requestGetStarted, signedIn }: LandingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isConnected, account } = useWallet();
  const { activeSection } = useLandingHomeScroll();
  const onHome = page === "home";
  const walletGate = walletConnectRequiresAccount() && !signedIn;
  const walletLabel =
    isConnected && account
      ? truncateAddr(account.publicKey, 5, 4)
      : walletGate
        ? "Wallet · sign up"
        : "Connect wallet";

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const goSection = (section: LandingHomeSectionId) => {
    setMobileOpen(false);
    if (page !== "home") {
      setPage("home");
      setTimeout(() => scrollToSection(section), 90);
      return;
    }
    scrollToSection(section);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-white/[0.06]",
          "supports-[backdrop-filter]:backdrop-blur-xl",
        )}
        style={{
          background: "rgba(5,8,7,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPage("home")}
            className="flex items-center gap-3 shrink-0 focus-ring rounded-xl pr-2"
            aria-label="ROOTCHAIN home"
          >
            <div
              className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #059669 0%, #022c22 100%)",
                boxShadow:
                  "0 0 28px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              <Sprout className="w-5 h-5 text-amber-200/95" strokeWidth={2.6} />
              <div className="absolute inset-0 rounded-xl border border-emerald-400/25" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="font-black text-sm tracking-tight text-white leading-none">ROOTCHAIN</div>
              <div className="text-[9px] font-bold tracking-[0.22em] text-emerald-400/80 uppercase mt-0.5">
                Stellar AgriFi
              </div>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center min-w-0">
            {NAV.map((item) => {
              const isActive = onHome && activeSection === item.section;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => goSection(item.section)}
                  className={cn(
                    "relative px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors",
                    isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.04]",
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-2 right-2 h-0.5 rounded-full bg-emerald-400/90" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setPage("marketplace")}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[12px] font-semibold text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-amber-200/80" />
              Marketplace
            </button>
            <button
              type="button"
              onClick={() => onConnectWallet()}
              className="hidden sm:inline-flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] font-semibold text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <Wallet className="w-4 h-4 text-emerald-400/90" />
              {walletLabel}
            </button>
            <Btn variant="ghost" size="sm" className="hidden md:inline-flex" onClick={() => setPage("login")}>
              Log in
            </Btn>
            <Btn variant="primary" size="sm" className="hidden sm:inline-flex" onClick={requestGetStarted}>
              Get started
            </Btn>
            <Btn variant="primary" size="sm" className="sm:hidden px-3" onClick={requestGetStarted}>
              Start
            </Btn>

            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-white/[0.06] border border-white/[0.06]"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden overflow-hidden border-b border-white/[0.06] z-40"
            style={{ background: "rgba(5,8,7,0.96)" }}
          >
            <div className="px-4 py-4 flex flex-col gap-1 max-w-[1400px] mx-auto">
              {NAV.map((item) => {
                const isActive = onHome && activeSection === item.section;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => goSection(item.section)}
                    className={cn(
                      "text-left px-4 py-3 rounded-xl font-semibold border border-transparent",
                      isActive ? "text-white bg-white/[0.06] border-white/[0.08]" : "text-slate-200 hover:bg-white/[0.05]",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setPage("marketplace");
                }}
                className="text-left px-4 py-3 rounded-xl font-semibold text-slate-200 hover:bg-white/[0.05]"
              >
                Marketplace
              </button>
              <div className="flex gap-2 pt-3 mt-2 border-t border-white/[0.06]">
                <Btn variant="outline" className="flex-1" onClick={() => { setMobileOpen(false); setPage("login"); }}>
                  Log in
                </Btn>
                <Btn
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setMobileOpen(false);
                    requestGetStarted();
                  }}
                >
                  Get started
                </Btn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { LandingNav } from "@/components/marketing/LandingNav";
import { LandingFooter } from "@/components/marketing/LandingFooter";
import { GetStartedModal } from "@/components/marketing/get-started-modal";
import {
  LandingHomeScrollProvider,
  useLandingHomeScroll,
} from "@/components/marketing/landing-home-scroll-context";
import type { Page } from "@/lib/nav";

export interface MarketingLayoutProps {
  page: Page;
  setPage: (p: Page) => void;
  onConnectWallet: () => void;
  signedIn: boolean;
  children: ReactNode;
}

function MarketingLayoutInner({
  page,
  setPage,
  onConnectWallet,
  signedIn,
  children,
}: MarketingLayoutProps) {
  const { scrollProgress, reset } = useLandingHomeScroll();
  const isHome = page === "home";
  const [getStartedOpen, setGetStartedOpen] = useState(false);

  useEffect(() => {
    if (!isHome) reset();
  }, [isHome, reset]);

  return (
    <div className="flex flex-col min-h-screen">
      <GetStartedModal open={getStartedOpen} onOpenChange={setGetStartedOpen} setPage={setPage} />
      <LandingNav
        page={page}
        setPage={setPage}
        onConnectWallet={onConnectWallet}
        signedIn={signedIn}
        requestGetStarted={() => setGetStartedOpen(true)}
      />
      {isHome && (
        <div className="h-[3px] w-full bg-white/[0.06] shrink-0" aria-hidden>
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-amber-400/90 transition-[width] duration-200 ease-out will-change-[width]"
            style={{ width: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
          />
        </div>
      )}
      <main id="main-scroll" className="flex-1 w-full min-w-0">
        <div className={isHome ? "w-full" : "w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
          {children}
        </div>
      </main>
      <LandingFooter setPage={setPage} requestGetStarted={() => setGetStartedOpen(true)} />
    </div>
  );
}

export function MarketingLayout(props: MarketingLayoutProps) {
  return (
    <LandingHomeScrollProvider>
      <MarketingLayoutInner {...props} />
    </LandingHomeScrollProvider>
  );
}

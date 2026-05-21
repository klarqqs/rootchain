import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AmbientBg } from "@/components/layout/ambient-bg";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { MarketingLayout } from "@/layouts/MarketingLayout";
import { InvestModal } from "@/components/modals/invest-modal";
import { QRVerifyModal } from "@/components/modals/qr-verify-modal";
import { TxDetailModal } from "@/components/modals/tx-detail-modal";
import { UploadModal } from "@/components/modals/upload-modal";
import { WalletModal } from "@/components/modals/wallet-modal";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/common/error-boundary";
import type { SidebarToolAction } from "@/components/layout/sidebar";
import { DemoEnvironmentBanner } from "@/components/layout/demo-environment-banner";
import { CommunityPage } from "@/pages/community";
import { DashboardPage } from "@/pages/dashboard";
import { FarmersPage } from "@/pages/farmers";
import { HelpPage } from "@/pages/help";
import { HomePage } from "@/pages/home";
import { AboutPage } from "@/pages/about";
import { MarketplacePage } from "@/pages/marketplace";
import { FarmerRegisterPage } from "@/pages/farmer-register";
import { PrivacyPage } from "@/pages/privacy";
import { TermsPage } from "@/pages/terms";
import { RoadmapPage } from "@/pages/roadmap";
import { AdminPage } from "@/pages/admin";
import { CompliancePage } from "@/pages/compliance";
import { EcosystemPartnersPage } from "@/pages/ecosystem";
import { InsightsPage } from "@/pages/insights";
import { PilotLaunchPage } from "@/pages/launch";
import { VerificationPage } from "@/pages/verification";
import { WalletPage } from "@/pages/wallet";
import { LoginPage } from "@/pages/login";
import { SignupPage } from "@/pages/signup";
import { ForgotPasswordPage } from "@/pages/forgot-password";
import { AccountPage } from "@/pages/account";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";
import { AiAssistantDock } from "@/components/ai/ai-assistant-dock";
import type { ProduceItem } from "@/data/produce";
import type { Page } from "@/lib/nav";
import { getAppLayoutMode } from "@/lib/layout-mode";
import {
  isSupabaseAuthEnforced,
  routeRequiresAuthentication,
  routeAllowsFarmerIntake,
  stashReturnPage,
} from "@/lib/auth-routes";
import { walletConnectRequiresAccount } from "@/lib/platform-mode";
import { useWallet } from "@/hooks/use-wallet";
import { useIdentityBootstrap } from "@/hooks/use-identity-bootstrap";
import { useHorizonSync } from "@/hooks/use-horizon-sync";
import { useStellarRuntimeBridge } from "@/hooks/use-stellar-runtime-bridge";
import { useMarketFeedSimulator } from "@/hooks/use-market-feed";
import { usePortfolioStore } from "@/store/portfolio.store";
import { useIdentityStore } from "@/store/identity.store";
import { useNotificationsStore } from "@/store/notifications.store";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<Page>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [investItem, setInvestItem] = useState<ProduceItem | null>(null);
  const [qrItem, setQrItem] = useState<ProduceItem | null>(null);
  const [txDetailHash, setTxDetailHash] = useState<string | null>(null);

  const { isConnected } = useWallet();

  useIdentityBootstrap();
  useStellarRuntimeBridge();
  // Phase 3: real-time Horizon sync (starts/stops with wallet connection).
  useHorizonSync();
  // Simulated market feed for landing page live activity.
  useMarketFeedSimulator();

  useEffect(() => {
    usePortfolioStore.getState().seedIfEmpty();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  const hydration = useIdentityStore((s) => s.hydration);
  const session = useIdentityStore((s) => s.session);
  const profile = useIdentityStore((s) => s.profile);
  const passwordRecovery = useIdentityStore((s) => s.passwordRecoveryMode);
  const recoveryRoutedRef = useRef(false);
  const sessionUid = session?.user?.id ?? "";
  const farmerGateKey = profile ? `${profile.id}:${profile.role}` : "";
  const signedIn = Boolean(sessionUid);
  const layoutMode = getAppLayoutMode(page, signedIn);

  useEffect(() => {
    if (!passwordRecovery) recoveryRoutedRef.current = false;
  }, [passwordRecovery]);

  useEffect(() => {
    if (
      !passwordRecovery ||
      hydration !== "ready" ||
      !isSupabaseAuthEnforced() ||
      recoveryRoutedRef.current
    ) {
      return;
    }
    recoveryRoutedRef.current = true;
    queueMicrotask(() => setPage("account"));
  }, [passwordRecovery, hydration]);

  useEffect(() => {
    if (!isSupabaseAuthEnforced()) return;
    if (hydration !== "ready") return;

    const authed = Boolean(sessionUid);

    if (routeRequiresAuthentication(page) && !authed) {
      stashReturnPage(page);
      queueMicrotask(() => setPage("login"));
      return;
    }

    if (page === "register" && authed && !routeAllowsFarmerIntake(profile)) {
      useNotificationsStore.getState().push({
        tone: "warning",
        title: "Farmer profile required",
        description: "Sign in as a cooperative operator or escalate with platform admin access.",
        duration: 6200,
      });
      queueMicrotask(() => setPage("marketplace"));
    }
  }, [page, hydration, sessionUid, farmerGateKey, profile]);

  useEffect(() => {
    if (layoutMode === "marketing") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const main = document.getElementById("main-scroll");
      if (main) main.scrollTop = 0;
      return;
    }
    const main = document.getElementById("main-scroll");
    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, layoutMode]);

  const handleConnectClick = () => {
    if (isConnected) setPage("wallet");
    else setWalletOpen(true);
  };

  /** Marketing / landing: wallet only after account exists (when Supabase auth is active). */
  const handleMarketingWalletConnect = () => {
    if (walletConnectRequiresAccount() && !signedIn) {
      useNotificationsStore.getState().push({
        tone: "info",
        title: "Create your account first",
        description: "Sign up or log in, then connect Freighter to deposit and invest on-chain.",
        duration: 7200,
      });
      stashReturnPage(page);
      setPage("signup");
      return;
    }
    if (isConnected) setPage("wallet");
    else setWalletOpen(true);
  };

  const handleSidebarToolAction = (action: SidebarToolAction) => {
    if (action === "upload") {
      setUploadOpen(true);
      return;
    }
    if (action === "admin") {
      setPage("admin");
      return;
    }
    if (action === "audit") {
      setPage("dashboard");
      return;
    }
    setPage("help");
  };

  const pageSwitch = (
    <>
      {page === "home" && (
        <HomePage setPage={setPage} />
      )}
      {page === "about" && <AboutPage setPage={setPage} />}
      {page === "marketplace" && (
        <MarketplacePage
          onInvest={(it) => {
            if (walletConnectRequiresAccount() && !signedIn) {
              useNotificationsStore.getState().push({
                tone: "info",
                title: "Sign in to invest",
                description: "Create an account, connect Freighter, then allocate capital on-chain.",
                duration: 6800,
              });
              stashReturnPage("marketplace");
              setPage("signup");
              return;
            }
            setInvestItem(it);
          }}
          onVerify={(it) => setQrItem(it)}
          setUploadOpen={setUploadOpen}
        />
      )}
      {page === "farmers" && <FarmersPage />}
      {page === "community" && <CommunityPage />}
      {page === "help" && <HelpPage setPage={setPage} />}
      {page === "privacy" && <PrivacyPage />}
      {page === "terms" && <TermsPage />}
      {page === "roadmap" && <RoadmapPage />}
      {page === "launch" && <PilotLaunchPage />}
      {page === "ecosystem" && <EcosystemPartnersPage />}
      {page === "compliance" && <CompliancePage setPage={setPage} />}
      {page === "login" && <LoginPage setPage={setPage} />}
      {page === "signup" && <SignupPage setPage={setPage} />}
      {page === "forgot-password" && <ForgotPasswordPage setPage={setPage} />}
      {layoutMode === "dashboard" && page === "verification" && <VerificationPage />}
      {layoutMode === "dashboard" && page === "dashboard" && (
        <DashboardPage onTxClick={(hash) => setTxDetailHash(hash)} />
      )}
      {layoutMode === "dashboard" && page === "wallet" && (
        <WalletPage
          walletConnected={isConnected}
          onConnectWallet={() => setWalletOpen(true)}
          onTxClick={(hash) => setTxDetailHash(hash)}
        />
      )}
      {layoutMode === "dashboard" && page === "register" && <FarmerRegisterPage />}
      {layoutMode === "dashboard" && page === "insights" && <InsightsPage />}
      {layoutMode === "dashboard" && page === "admin" && <AdminPage />}
      {layoutMode === "dashboard" && page === "account" && <AccountPage setPage={setPage} />}
    </>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen text-white">
        <AmbientBg />
        <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>
        <DemoEnvironmentBanner />

        {layoutMode === "marketing" ? (
          <MarketingLayout
            page={page}
            setPage={setPage}
            onConnectWallet={handleMarketingWalletConnect}
            signedIn={signedIn}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <ErrorBoundary key={`page-${page}`}>{pageSwitch}</ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          </MarketingLayout>
        ) : (
          <DashboardLayout
            page={page}
            setPage={setPage}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onConnectWallet={handleConnectClick}
            onSidebarToolAction={handleSidebarToolAction}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <ErrorBoundary key={`page-${page}`}>{pageSwitch}</ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          </DashboardLayout>
        )}

        <WalletModal
          open={walletOpen}
          onClose={() => setWalletOpen(false)}
          onConnect={() => {
            /* state mutated inside modal via useWallet */
          }}
        />
        <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
        <InvestModal
          open={!!investItem}
          onClose={() => setInvestItem(null)}
          item={investItem}
          onTxComplete={(hash) => setTxDetailHash(hash)}
        />
        <QRVerifyModal
          open={!!qrItem}
          onClose={() => setQrItem(null)}
          item={qrItem}
        />
        <TxDetailModal
          open={!!txDetailHash}
          onClose={() => setTxDetailHash(null)}
          hash={txDetailHash}
        />
        <OnboardingFlow />
        {layoutMode === "dashboard" && (
          <AiAssistantDock page={page} onOpenWalletModal={() => setWalletOpen(true)} />
        )}
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import {
  Home as HomeIcon,
  Store,
  ShieldCheck,
  LineChart as LineChartIcon,
  MessagesSquare,
  Wallet,
  Sprout,
  Upload,
  Cpu,
  Database,
  ChevronUp,
  Settings,
  Users,
  HelpCircle,
  FileText,
  Map,
  ScrollText,
  ShieldHalf,
  Rocket,
  Handshake,
  Satellite,
  ClipboardCheck,
  ClipboardPenLine,
  LogIn,
  UserRound,
  Wheat,
  Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { cn, truncateAddr } from "@/lib/utils";
import { sidebarNetworkRibbon } from "@/lib/stellar/effective-network";
import { useStellarRuntimeStore } from "@/store/stellar-runtime.store";
import type { Page } from "@/lib/nav";
import { useWallet } from "@/hooks/use-wallet";
import { useIdentityStore } from "@/store/identity.store";
import { isSupabaseAuthEnforced } from "@/lib/auth-routes";

export type SidebarToolAction = "upload" | "admin" | "audit" | "settings";

interface SidebarProps {
  page: Page;
  setPage: (p: Page) => void;
  open: boolean;
  setOpen: (b: boolean) => void;
  onConnectWallet: () => void;
  onToolAction?: (action: SidebarToolAction) => void;
}

interface NavItem {
  id: Page;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

const PRIMARY: NavItem[] = [
  { id: "home", label: "Overview", icon: HomeIcon },
  { id: "marketplace", label: "Marketplace", icon: Store, badge: "9" },
  { id: "farmers", label: "Farmers", icon: Users },
  { id: "verification", label: "Verification", icon: ShieldCheck },
  { id: "dashboard", label: "Analytics", icon: LineChartIcon },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "community", label: "Community", icon: MessagesSquare, badge: "3" },
];

const RESOURCE_LINKS: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: "help", label: "Help & FAQ", icon: HelpCircle },
  { id: "about", label: "About", icon: Info },
  { id: "login", label: "Sign in", icon: LogIn },
  { id: "signup", label: "Create account", icon: ClipboardPenLine },
  { id: "account", label: "My profile", icon: UserRound },
  { id: "register", label: "Farmer onboarding", icon: Wheat },
  { id: "launch", label: "Launch / waitlist", icon: Rocket },
  { id: "ecosystem", label: "Partners", icon: Handshake },
  { id: "insights", label: "Ag intelligence", icon: Satellite },
  { id: "compliance", label: "Compliance", icon: ClipboardCheck },
  { id: "privacy", label: "Privacy", icon: ScrollText },
  { id: "terms", label: "Terms", icon: FileText },
  { id: "roadmap", label: "Roadmap", icon: Map },
  { id: "admin", label: "Console", icon: ShieldHalf },
];

const TOOLS: { label: string; icon: LucideIcon; action: SidebarToolAction }[] = [
  { label: "Upload Produce", icon: Upload, action: "upload" },
  { label: "Operator Console", icon: Cpu, action: "admin" },
  { label: "Audit Trail", icon: Database, action: "audit" },
  { label: "Workspace prefs", icon: Settings, action: "settings" },
];

export function Sidebar({ page, setPage, open, setOpen, onConnectWallet, onToolAction }: SidebarProps) {
  const { isConnected, account, balances, totalUsd } = useWallet();
  const enforced = isSupabaseAuthEnforced();
  const authReady = useIdentityStore((s) => s.hydration === "ready");
  const signedIn = useIdentityStore((s) => !!s.session?.user);
  const identityProfile = useIdentityStore((s) => s.profile);
  const usdc = balances.find((b) => b.symbol === "USDC" || b.asset === "USDC");
  /** Re-render branding when persisted ledger overrides change mid-session */
  useStellarRuntimeStore((s) => s.userNetworkOverride);
  const ribbon = sidebarNetworkRibbon();

  const handleTool = (action: SidebarToolAction) => {
    onToolAction?.(action);
    setOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x:
            open ||
            typeof window === "undefined" ||
            window.innerWidth >= 1024
              ? 0
              : -280,
        }}
        className="fixed lg:sticky top-0 left-0 h-[100dvh] w-[260px] shrink-0 z-50 border-r border-line flex flex-col pb-[env(safe-area-inset-bottom)]"
        style={{
          background: "rgba(10,14,12,0.85)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
        }}
      >
        {/* Logo */}
        <div className="px-6 py-5 flex items-center gap-3 border-b border-line">
          <div
            className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #84CC16 0%, #166534 100%)",
              boxShadow: "0 0 24px rgba(132,204,22,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <Sprout className="w-5 h-5 text-black" strokeWidth={2.6} />
            <div className="absolute inset-0 rounded-xl border border-lime-300/30" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-base text-white tracking-tight">ROOTCHAIN</div>
            <div className="text-[9px] font-bold tracking-[0.25em] text-lime-400/70">{ribbon}</div>
          </div>
        </div>

        {/* Network status */}
        <div className="px-6 py-3 border-b border-line">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-slate-400">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-lime-400 opacity-75" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-lime-400" />
            </span>
            <span className="truncate">Synced · Block stream healthy</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto overscroll-contain touch-pan-y">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-600">
            Platform
          </div>
          {PRIMARY.map((it) => {
            const active = page === it.id;
            return (
              <button
                key={it.id}
                onClick={() => {
                  setPage(it.id);
                  setOpen(false);
                }}
                className={cn(
                  "touch-manipulation w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 group focus-ring",
                  active
                    ? "bg-lime-500/10 text-lime-300 border border-lime-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent",
                )}
              >
                <it.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left truncate">{it.label}</span>
                {it.badge && !active && (
                  <span className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-[10px] text-slate-300 font-bold">
                    {it.badge}
                  </span>
                )}
                {active && (
                  <div className="w-1 h-1 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(132,204,22,0.8)]" />
                )}
              </button>
            );
          })}

          <div className="px-3 pt-6 pb-2 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-600">
            Resources & trust
          </div>
          {RESOURCE_LINKS.map((it) => {
            if (it.id === "login" || it.id === "signup") {
              if (!authReady || signedIn) return null;
            }
            if (it.id === "account") {
              if (!authReady || !signedIn) return null;
            }
            if (it.id === "admin" && enforced && identityProfile?.role !== "admin") return null;
            const active = page === it.id;
            return (
              <button
                key={it.id}
                onClick={() => {
                  setPage(it.id);
                  setOpen(false);
                }}
                className={cn(
                  "touch-manipulation w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all focus-ring",
                  active
                    ? "bg-violet-500/10 text-violet-200 border border-violet-500/20"
                    : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent",
                )}
              >
                <it.icon className="w-4 h-4 shrink-0" />
                <span className="truncate text-left">{it.label}</span>
              </button>
            );
          })}

          <div className="px-3 pt-6 pb-2 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-600">
            Tools
          </div>
          {TOOLS.map((it) => (
            <button
              key={it.label}
              type="button"
              onClick={() => handleTool(it.action)}
              className="touch-manipulation w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white transition focus-ring text-left"
            >
              <it.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{it.label}</span>
            </button>
          ))}
        </nav>

        {/* Wallet preview */}
        <div className="p-4 border-t border-line">
          {isConnected && account ? (
            <Glass className="p-3" glow>
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-2">
                <Wallet className="w-3 h-3" /> {account.label ?? "Connected"}
                <span className="ml-auto flex items-center gap-1 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
              <div className="font-mono text-xs text-white truncate mb-2">
                {truncateAddr(account.publicKey, 10, 8)}
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-black text-lg text-white tabular-nums">
                    {(usdc?.amount ?? totalUsd).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] font-bold text-lime-400">
                    {usdc ? "USDC" : "USD value"}
                  </div>
                </div>
                <button
                  onClick={() => setPage("wallet")}
                  className="touch-manipulation text-[10px] font-bold text-lime-300 hover:text-lime-200 inline-flex items-center gap-0.5"
                >
                  OPEN <ChevronUp className="w-3 h-3 rotate-90" />
                </button>
              </div>
            </Glass>
          ) : (
            <Glass className="p-3 text-center" glow>
              <Wallet className="w-5 h-5 text-lime-400 mx-auto mb-1.5" />
              <div className="text-[11px] font-bold text-white mb-2">Connect to invest</div>
              <button
                type="button"
                onClick={onConnectWallet}
                className="touch-manipulation w-full py-1.5 rounded-lg bg-lime-400 text-black text-[11px] font-bold hover:bg-lime-300 transition min-h-[44px]"
              >
                Connect Wallet
              </button>
            </Glass>
          )}
        </div>
      </motion.aside>
    </>
  );
}

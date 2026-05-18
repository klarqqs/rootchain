import { LockKeyhole, Menu, Search, UserRound, Verified, Wallet } from "lucide-react";
import { useState } from "react";
import { Btn } from "@/components/ui/button";
import { Ticker } from "./ticker";
import { PAGE_META, type Page } from "@/lib/nav";
import { truncateAddr } from "@/lib/utils";
import { useWallet } from "@/hooks/use-wallet";
import { NotificationDrawer } from "@/components/layout/notification-drawer";
import { useIdentityStore } from "@/store/identity.store";
import { signOutEverywhere } from "@/services/auth-session.service";

interface TopBarProps {
  setSidebarOpen: (b: boolean) => void;
  onConnectWallet: () => void;
  setPage?: (p: Page) => void;
  page: Page;
}

export function TopBar({ setSidebarOpen, onConnectWallet, setPage, page }: TopBarProps) {
  const meta = PAGE_META[page];
  const { isConnected, account } = useWallet();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const authReady = useIdentityStore((s) => s.hydration === "ready");
  const signedIn = useIdentityStore((s) => !!s.session?.user);
  return (
    <div
      className="sticky top-0 z-30 border-b border-line"
      style={{
        background: "rgba(7,10,9,0.78)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
      }}
    >
      <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 h-16">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/5"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="font-black text-base sm:text-lg text-white tracking-tight truncate">
            {meta.title}
          </h1>
          <p className="text-xs text-slate-500 truncate hidden sm:block">{meta.subtitle}</p>
        </div>

        <div
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-line w-64 lg:w-80"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            placeholder="Search produce, farmers, hashes…"
            className="bg-transparent outline-none text-sm text-white placeholder:text-slate-600 flex-1 min-w-0"
          />
          <kbd className="text-[10px] font-bold text-slate-500 px-1.5 py-0.5 rounded border border-white/10 shrink-0">
            ⌘K
          </kbd>
        </div>

        <NotificationDrawer
          open={notificationsOpen}
          onToggle={() => setNotificationsOpen((prev) => !prev)}
        />

        {authReady && setPage && (
          <>
            {signedIn ? (
              <>
                <Btn
                  variant="outline"
                  size="sm"
                  icon={UserRound}
                  className="shrink-0 hidden sm:inline-flex"
                  onClick={() => setPage("account")}
                >
                  Profile
                </Btn>
                <Btn variant="ghost" size="sm" className="shrink-0 hidden md:inline-flex text-slate-400" onClick={() => void signOutEverywhere()}>
                  Sign out
                </Btn>
              </>
            ) : (
              <Btn variant="outline" size="sm" icon={LockKeyhole} className="shrink-0" onClick={() => setPage("login")}>
                <span className="hidden sm:inline">Sign in</span>
                <span className="sm:hidden">Login</span>
              </Btn>
            )}
          </>
        )}

        <Btn
          onClick={onConnectWallet}
          variant={isConnected ? "outline" : "primary"}
          icon={isConnected ? Verified : Wallet}
          size="md"
          className="shrink-0"
        >
          <span className="hidden sm:inline">
            {isConnected && account ? truncateAddr(account.publicKey, 6, 4) : "Connect Wallet"}
          </span>
          <span className="sm:hidden">{isConnected ? "Connected" : "Connect"}</span>
        </Btn>
      </div>
      <Ticker />
    </div>
  );
}

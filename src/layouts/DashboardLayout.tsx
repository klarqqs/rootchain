import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import type { SidebarToolAction } from "@/components/layout/sidebar";
import type { Page } from "@/lib/nav";

export interface DashboardLayoutProps {
  page: Page;
  setPage: (p: Page) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (b: boolean) => void;
  onConnectWallet: () => void;
  onSidebarToolAction: (action: SidebarToolAction) => void;
  children: ReactNode;
}

export function DashboardLayout({
  page,
  setPage,
  sidebarOpen,
  setSidebarOpen,
  onConnectWallet,
  onSidebarToolAction,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex">
      <Sidebar
        page={page}
        setPage={setPage}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        onConnectWallet={onConnectWallet}
        onToolAction={onSidebarToolAction}
      />
      <main
        id="main-scroll"
        className="flex-1 min-w-0 min-h-[100dvh] overflow-y-auto overscroll-y-contain"
      >
        <TopBar
          setSidebarOpen={setSidebarOpen}
          onConnectWallet={onConnectWallet}
          setPage={setPage}
          page={page}
        />
        <div className="px-4 sm:px-6 lg:px-8 pt-6">{children}</div>
      </main>
    </div>
  );
}

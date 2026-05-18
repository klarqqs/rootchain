import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ActivityItem } from "@/types/activity";

interface NotificationPrefsState {
  desktop: boolean;
  emailStub: boolean;
  muteInvest: boolean;
  muteEscrow: boolean;
  setDesktop: (v: boolean) => void;
  setEmailStub: (v: boolean) => void;
  setMuteInvest: (v: boolean) => void;
  setMuteEscrow: (v: boolean) => void;
}

export function shouldMirrorActivity(category: ActivityItem["category"]): boolean {
  const { muteInvest, muteEscrow } = useNotificationPrefsStore.getState();
  if (muteInvest && (category === "invest" || category === "distribution")) return false;
  if (muteEscrow && (category === "escrow" || category === "milestone")) return false;
  return true;
}

export const useNotificationPrefsStore = create<NotificationPrefsState>()(
  persist(
    (set) => ({
      desktop: false,
      emailStub: import.meta.env.DEV,
      muteInvest: false,
      muteEscrow: false,
      setDesktop: (v) => set({ desktop: v }),
      setEmailStub: (v) => set({ emailStub: v }),
      setMuteInvest: (v) => set({ muteInvest: v }),
      setMuteEscrow: (v) => set({ muteEscrow: v }),
    }),
    {
      name: "rootchain.notify-prefs.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

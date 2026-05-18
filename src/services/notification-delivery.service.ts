import type { ActivityItem } from "@/types/activity";
import { useNotificationPrefsStore } from "@/store/notification-prefs.store";

/**
 * Push-ready + email-stub layer. Wire SES/Resend/Supabase functions in production.
 */
export function relayActivityNotification(item: ActivityItem): void {
  const { desktop, emailStub } = useNotificationPrefsStore.getState();

  if (desktop && typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      try {
        new Notification(item.title, {
          body: item.body,
          tag: item.id,
        });
      } catch {
        /* ignore */
      }
    }
  }

  if (emailStub && import.meta.env.DEV) {
    // Production would enqueue a server job — keep as structured log for audits.
    console.info("[email-stub]", item.category, item.title, item.body ?? "");
  }
}

export async function requestDesktopNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  const res = await Notification.requestPermission();
  return res;
}

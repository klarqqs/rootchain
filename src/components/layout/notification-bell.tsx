import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Glass } from "@/components/ui/glass";
import { useInAppNotificationsStore } from "@/store/in-app-notifications.store";
import { isApiBackendConfigured } from "@/lib/api/config";
import { useRealtime } from "@/hooks/use-realtime";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { items, unread, fetch, markRead, markAllRead } = useInAppNotificationsStore();

  useEffect(() => {
    if (isApiBackendConfigured()) void fetch();
  }, [fetch]);

  useRealtime((event) => {
    if (event.type === "notification") void fetch();
  });

  if (!isApiBackendConfigured()) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          void fetch();
        }}
        className="relative p-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-slate-300" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-lime-500 text-black text-[10px] font-black flex items-center justify-center px-1">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <Glass className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto z-50 p-3 space-y-2 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-white text-sm">Notifications</span>
            {unread > 0 && (
              <button
                type="button"
                className="text-[10px] text-lime-400 font-bold uppercase"
                onClick={() => void markAllRead()}
              >
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No notifications</p>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => !n.read && void markRead(n.id)}
                className={`w-full text-left rounded-lg px-3 py-2 border transition-colors ${
                  n.read ? "border-transparent opacity-60" : "border-lime-500/20 bg-lime-500/5"
                }`}
              >
                <div className="font-bold text-white text-xs">{n.title}</div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{n.body}</p>
              </button>
            ))
          )}
        </Glass>
      )}
    </div>
  );
}

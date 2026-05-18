import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Glass } from "@/components/ui/glass";
import { Btn } from "@/components/ui/button";
import type { ActivityItem } from "@/types/activity";
import { useActivityFeedStore } from "@/store/activity-feed.store";
import { cn } from "@/lib/utils";

interface NotificationDrawerProps {
  open: boolean;
  onToggle: () => void;
}

const toneAccent: Record<ActivityItem["tone"], string> = {
  neutral: "text-slate-200",
  success: "text-lime-300",
  warning: "text-amber-300",
  danger: "text-rose-300",
};

function ActivityRow({
  activity,
  onSelect,
}: {
  activity: ActivityItem;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border border-white/[0.04] px-3 py-2.5 flex flex-col gap-1 text-left transition hover:border-lime-500/30 hover:bg-white/[0.02]",
        activity.read ? "opacity-65" : "opacity-100",
      )}
    >
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-500">
        <Bell className="w-3 h-3" />
        {activity.category}
        {!activity.read && <span className="text-[9px] text-lime-300">New</span>}
      </div>
      <div className={`text-xs font-black ${toneAccent[activity.tone]}`}>{activity.title}</div>
      {activity.body && <div className="text-[11px] text-slate-500 leading-snug">{activity.body}</div>}
      <div className="text-[10px] text-slate-600">{new Date(activity.createdAt).toLocaleString()}</div>
    </button>
  );
}

export function NotificationDrawer({ open, onToggle }: NotificationDrawerProps) {
  const { items, markRead, markAllRead, unread } = useActivityFeedStore();

  const handleBackdrop = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onToggle();
  };

  return (
    <div className="relative shrink-0">
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          onMouseDown={handleBackdrop}
          aria-hidden
        />
      )}
      <div className="relative z-50">
        <button
          type="button"
          onClick={() => {
            onToggle();
          }}
          className="relative p-2 rounded-xl hover:bg-white/5 transition shrink-0"
          aria-expanded={open}
          aria-haspopup="true"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-300" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(132,204,22,0.8)] animate-pulse" />
          )}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-[calc(100%+12px)] w-[min(92vw,380px)]"
            >
              <Glass className="p-4 elevated" glow={false}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-black text-sm text-white">Activity center</div>
                    <div className="text-[11px] text-slate-500">Synced with escrow + Stellar confirmations</div>
                  </div>
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={(evt: ReactMouseEvent<HTMLButtonElement>) => {
                      evt.preventDefault();
                      markAllRead();
                    }}
                  >
                    Clear badges
                  </Btn>
                </div>
                <div className="max-h-[440px] overflow-y-auto space-y-2 pr-1">
                  {items.length === 0 && (
                    <div className="text-xs text-slate-500 text-center py-6">
                      No alerts yet · investments and escrow updates land here instantly.
                    </div>
                  )}
                  {items.map((item) => (
                    <ActivityRow key={item.id} activity={item} onSelect={() => markRead(item.id)} />
                  ))}
                </div>
                <div className="mt-3 text-[10px] text-slate-500 leading-relaxed">
                  Push transports stubbed ahead of websocket fan-out — events mirror your local escrow simulation.
                </div>
              </Glass>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from "lucide-react";
import { useNotificationsStore } from "@/store/notifications.store";
import type { Toast, ToastTone } from "@/types/notifications";
import { cn } from "@/lib/utils";

const TONE_META: Record<
  ToastTone,
  { icon: typeof CheckCircle2; ring: string; iconColor: string; bg: string }
> = {
  success: {
    icon: CheckCircle2,
    ring: "border-lime-500/40",
    iconColor: "text-lime-400",
    bg: "from-lime-500/15 to-transparent",
  },
  error: {
    icon: XCircle,
    ring: "border-rose-500/40",
    iconColor: "text-rose-400",
    bg: "from-rose-500/15 to-transparent",
  },
  warning: {
    icon: AlertTriangle,
    ring: "border-amber-500/40",
    iconColor: "text-amber-400",
    bg: "from-amber-500/15 to-transparent",
  },
  info: {
    icon: Info,
    ring: "border-sky-500/30",
    iconColor: "text-sky-400",
    bg: "from-sky-500/15 to-transparent",
  },
  loading: {
    icon: Loader2,
    ring: "border-lime-500/30",
    iconColor: "text-lime-400 animate-spin",
    bg: "from-lime-500/10 to-transparent",
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useNotificationsStore((s) => s.dismiss);
  const meta = TONE_META[toast.tone];
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className={cn(
        "relative w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border surface backdrop-blur-xl glow-deep overflow-hidden",
        meta.ring,
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-r pointer-events-none opacity-50", meta.bg)} />
      <div className="relative p-4 flex items-start gap-3">
        <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0", meta.ring)}>
          <Icon className={cn("w-4 h-4", meta.iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-sm text-white truncate">{toast.title}</div>
          {toast.description && (
            <div className="text-xs text-slate-400 truncate mt-0.5 font-mono">
              {toast.description}
            </div>
          )}
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                dismiss(toast.id);
              }}
              className="mt-2 text-[11px] font-bold text-lime-300 hover:text-lime-200"
            >
              {toast.action.label} →
            </button>
          )}
        </div>
        <button
          onClick={() => dismiss(toast.id)}
          className="p-1 rounded-md hover:bg-white/5 text-slate-500 hover:text-white shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useNotificationsStore((s) => s.toasts);
  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-[150] flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

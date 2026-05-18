import { create } from "zustand";
import type { Toast, ToastTone } from "@/types/notifications";

interface NotificationsState {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id"> & { id?: string }) => string;
  update: (id: string, patch: Partial<Toast>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

const genId = () => `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export const useNotificationsStore = create<NotificationsState>((set) => ({
  toasts: [],
  push: ({ id, duration = 4500, tone = "info" as ToastTone, ...rest }) => {
    const next: Toast = { id: id ?? genId(), tone, duration, ...rest };
    set((s) => ({ toasts: [...s.toasts.filter((t) => t.id !== next.id), next] }));
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== next.id) }));
      }, duration);
    }
    return next.id;
  },
  update: (id, patch) =>
    set((s) => ({ toasts: s.toasts.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

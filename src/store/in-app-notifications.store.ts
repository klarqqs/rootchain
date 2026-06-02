import { create } from "zustand";
import { apiRequest } from "@/lib/api/http-client";
import { isApiBackendConfigured } from "@/lib/api/config";

export interface InAppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface InAppNotificationsState {
  items: InAppNotification[];
  unread: number;
  loading: boolean;
  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useInAppNotificationsStore = create<InAppNotificationsState>((set, get) => ({
  items: [],
  unread: 0,
  loading: false,
  fetch: async () => {
    if (!isApiBackendConfigured()) return;
    set({ loading: true });
    try {
      const data = await apiRequest<{ notifications: InAppNotification[]; unread: number }>(
        "/notifications/mine",
      );
      set({ items: data.notifications, unread: data.unread });
    } finally {
      set({ loading: false });
    }
  },
  markRead: async (id) => {
    if (!isApiBackendConfigured()) return;
    await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
    set({
      items: get().items.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unread: Math.max(0, get().unread - 1),
    });
  },
  markAllRead: async () => {
    if (!isApiBackendConfigured()) return;
    await apiRequest("/notifications/read-all", { method: "POST" });
    set({ items: get().items.map((n) => ({ ...n, read: true })), unread: 0 });
  },
}));

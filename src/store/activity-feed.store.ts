import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ActivityItem } from "@/types/activity";
import { relayActivityNotification } from "@/services/notification-delivery.service";
import { shouldMirrorActivity } from "@/store/notification-prefs.store";

const genId = () => `nf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const MAX_ITEMS = 40;

interface ActivityFeedState {
  items: ActivityItem[];
  unread: number;
  push: (
    draft: Omit<ActivityItem, "id" | "createdAt" | "read"> & {
      id?: string;
      read?: boolean;
    },
  ) => string;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useActivityFeedStore = create<ActivityFeedState>()(
  persist(
    (set, get) => ({
      items: [],
      unread: 0,
      push: (draft) => {
        const id = draft.id ?? genId();
        const item: ActivityItem = {
          id,
          createdAt: Date.now(),
          read: draft.read ?? false,
          category: draft.category,
          tone: draft.tone,
          title: draft.title,
          body: draft.body,
          meta: draft.meta,
        };
        const nextItems = [
          item,
          ...get().items.filter((i) => i.id !== item.id),
        ].slice(0, MAX_ITEMS);
        const unread = nextItems.reduce((acc, row) => acc + (row.read ? 0 : 1), 0);
        set({ items: nextItems, unread });
        if (shouldMirrorActivity(item.category)) {
          relayActivityNotification(item);
        }
        return item.id;
      },
      markRead: (id) =>
        set((s) => {
          const items = s.items.map((row) => (row.id === id ? { ...row, read: true } : row));
          return { items, unread: items.reduce((acc, row) => acc + (row.read ? 0 : 1), 0) };
        }),
      markAllRead: () =>
        set((s) => ({
          items: s.items.map((row) => ({ ...row, read: true })),
          unread: 0,
        })),
      clear: () => set({ items: [], unread: 0 }),
    }),
    {
      name: "rootchain.activity-feed.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.unread = state.items.reduce((acc, row) => acc + (row.read ? 0 : 1), 0);
      },
    },
  ),
);


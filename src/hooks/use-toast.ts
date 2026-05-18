import { useNotificationsStore } from "@/store/notifications.store";

/**
 * Compact toast helper. Returns the toast id so callers can update/dismiss.
 * Selectors are split so Zustand does not see a new object snapshot every render.
 */
export function useToast() {
  const push = useNotificationsStore((s) => s.push);
  const update = useNotificationsStore((s) => s.update);
  const dismiss = useNotificationsStore((s) => s.dismiss);
  const clear = useNotificationsStore((s) => s.clear);
  return { push, update, dismiss, clear };
}

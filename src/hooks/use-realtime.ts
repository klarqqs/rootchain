import { useEffect, useRef } from "react";
import { getApiBaseUrl } from "@/lib/api/config";
import { getAccessToken } from "@/lib/api/token-storage";
import { useNotificationsStore } from "@/store/notifications.store";

export type RealtimeHandler = (event: {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}) => void;

export function useRealtime(onEvent?: RealtimeHandler) {
  const push = useNotificationsStore((s) => s.push);
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    const base = getApiBaseUrl();
    if (!base) return;

    const token = getAccessToken();
    const url = `${base}/realtime/stream${token ? `?t=${encodeURIComponent(token)}` : ""}`;
    const es = new EventSource(url, { withCredentials: false });

    es.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data) as {
          type: string;
          payload: Record<string, unknown>;
          timestamp: string;
        };
        if (event.type === "connected") return;

        handlerRef.current?.(event);

        if (event.type === "notification") {
          push({
            tone: "info",
            title: String(event.payload.title ?? "Notification"),
            description: String(event.payload.body ?? ""),
            duration: 6000,
          });
        }
        if (event.type === "funding_progress") {
          push({
            tone: "success",
            title: "Funding update",
            description: `Project ${String(event.payload.pct ?? 0)}% funded`,
            duration: 4000,
          });
        }
      } catch {
        /* ignore */
      }
    };

    return () => es.close();
  }, [push]);
}

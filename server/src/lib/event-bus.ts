import { randomUUID } from "node:crypto";
import type { Response } from "express";
import { cacheGet, cacheSet, getRedis, isRedisEnabled } from "./redis.js";

export const REALTIME_CHANNEL = "rootchain:events";

export interface RealtimeEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

type SseClient = { id: string; res: Response; userId?: string };

const sseClients = new Map<string, SseClient>();
const memoryListeners = new Set<(event: RealtimeEvent) => void>();

export function registerSseClient(res: Response, userId?: string): string {
  const id = randomUUID();
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  sseClients.set(id, { id, res, userId });
  res.write(`data: ${JSON.stringify({ type: "connected", payload: {}, timestamp: new Date().toISOString() })}\n\n`);
  res.on("close", () => sseClients.delete(id));
  return id;
}

function writeSse(res: Response, event: RealtimeEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export async function publishEvent(event: RealtimeEvent): Promise<void> {
  for (const listener of memoryListeners) listener(event);
  for (const client of sseClients.values()) {
    try {
      writeSse(client.res, event);
    } catch {
      sseClients.delete(client.id);
    }
  }

  if (isRedisEnabled()) {
    const redis = await getRedis();
    await redis?.publish(REALTIME_CHANNEL, JSON.stringify(event));
  }
}

export function subscribeMemory(listener: (event: RealtimeEvent) => void): () => void {
  memoryListeners.add(listener);
  return () => memoryListeners.delete(listener);
}

export async function initRedisSubscriber(): Promise<void> {
  if (!isRedisEnabled()) return;
  const { getRedisSubscriber } = await import("./redis.js");
  const sub = await getRedisSubscriber();
  if (!sub) return;
  await sub.subscribe(REALTIME_CHANNEL);
  sub.on("message", (_ch: string, message?: string) => {
    if (!message) return;
    try {
      const event = JSON.parse(message) as RealtimeEvent;
      for (const client of sseClients.values()) {
        try {
          writeSse(client.res, event);
        } catch {
          sseClients.delete(client.id);
        }
      }
    } catch {
      /* ignore malformed */
    }
  });
}

export function sseClientCount(): number {
  return sseClients.size;
}

/** Dedupe rapid identical events (investment spam). */
const recentKeys = new Map<string, number>();

export function shouldEmitDeduped(key: string, windowMs = 3000): boolean {
  const now = Date.now();
  const last = recentKeys.get(key) ?? 0;
  if (now - last < windowMs) return false;
  recentKeys.set(key, now);
  if (recentKeys.size > 5000) {
    for (const [k, t] of recentKeys) {
      if (now - t > 60_000) recentKeys.delete(k);
    }
  }
  return true;
}

export async function getCachedOrCompute<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached) return cached;
  const value = await compute();
  await cacheSet(key, value, ttlSeconds);
  return value;
}

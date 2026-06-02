import { env } from "../config/env.js";
import { logger } from "./logger.js";

type RedisClient = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, mode?: string, ttl?: number) => Promise<unknown>;
  del: (key: string) => Promise<unknown>;
  publish: (channel: string, message: string) => Promise<unknown>;
  duplicate: () => RedisClient;
  connect: () => Promise<void>;
  subscribe: (channel: string) => Promise<void>;
  on: (event: string, cb: (arg: string, msg?: string) => void) => void;
  quit: () => Promise<void>;
};

let client: RedisClient | null = null;
let subscriber: RedisClient | null = null;
/** After a failed connect, skip Redis for this process (avoids ioredis retry spam). */
let redisDisabledForSession = false;

export function isRedisEnabled(): boolean {
  return Boolean(env.REDIS_URL?.trim()) && !redisDisabledForSession;
}

function attachRedisErrorHandler(redis: RedisClient, label: string): void {
  redis.on("error", (msg: string) => {
    logger.debug({ msg, label }, "Redis error");
  });
}

async function connectRedis(label: string): Promise<RedisClient | null> {
  if (!env.REDIS_URL?.trim() || redisDisabledForSession) return null;

  try {
    const Redis = (await import("ioredis")).default;
    const instance = new (Redis as unknown as new (
      url: string,
      opts: Record<string, unknown>,
    ) => RedisClient)(env.REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (times: number) => (times > 3 ? null : Math.min(times * 150, 1500)),
    });

    attachRedisErrorHandler(instance, label);
    await instance.connect();
    return instance;
  } catch (e) {
    redisDisabledForSession = true;
    logger.info(
      { err: e },
      "Redis unavailable — running without cache/pub-sub (optional: docker compose up -d redis)",
    );
    return null;
  }
}

export async function getRedis(): Promise<RedisClient | null> {
  if (!env.REDIS_URL?.trim()) return null;
  if (redisDisabledForSession) return null;
  if (client) return client;

  client = await connectRedis("client");
  return client;
}

export async function getRedisSubscriber(): Promise<RedisClient | null> {
  if (!env.REDIS_URL?.trim() || redisDisabledForSession) return null;
  if (subscriber) return subscriber;

  const sub = await connectRedis("subscriber");
  if (!sub) return null;
  subscriber = sub;
  return subscriber;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = await getRedis();
  if (!redis) return null;
  const raw = await redis.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function cacheDel(key: string): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;
  await redis.del(key);
}

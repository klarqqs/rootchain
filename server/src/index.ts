import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { initRedisSubscriber } from "./lib/event-bus.js";
import { getRedis, isRedisEnabled } from "./lib/redis.js";
import { logger } from "./lib/logger.js";

const app = createApp();

void initRedisSubscriber().catch((err) => logger.warn({ err }, "Redis subscriber init failed"));

app.listen(env.PORT, async () => {
  const redisConnected = Boolean(env.REDIS_URL?.trim()) && Boolean(await getRedis());
  logger.info(
    {
      port: env.PORT,
      stellar: env.STELLAR_NETWORK,
      cors: env.CORS_ORIGIN,
      redis: redisConnected ? "connected" : env.REDIS_URL?.trim() ? "disabled" : "off",
      realtime: "sse",
    },
    "ROOTCHAIN API listening",
  );
  if (env.REDIS_URL?.trim() && !isRedisEnabled()) {
    logger.info("Tip: unset REDIS_URL in server/.env for quiet local dev, or run: docker compose up -d redis");
  }
});

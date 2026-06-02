import "../scripts/load-env.mjs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { errorHandler } from "./middleware/error-handler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { walletRouter } from "./modules/wallets/wallet.routes.js";
import { projectRouter } from "./modules/projects/project.routes.js";
import { marketplaceRouter } from "./modules/marketplace/marketplace.routes.js";
import { investmentRouter } from "./modules/investments/investment.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { farmRouter } from "./modules/farms/farm.routes.js";
import { updateRouter } from "./modules/updates/update.routes.js";
import { transactionRouter } from "./modules/transactions/transaction.routes.js";
import { portfolioRouter } from "./modules/portfolio/portfolio.routes.js";
import { aiRouter } from "./modules/ai/ai.routes.js";
import { analyticsRouter } from "./modules/analytics/analytics.routes.js";
import { transparencyRouter } from "./modules/transparency/transparency.routes.js";
import { notificationRouter } from "./modules/notifications/notification.routes.js";
import { realtimeRouter } from "./modules/realtime/realtime.routes.js";
import { isRedisEnabled } from "./lib/redis.js";
import { sseClientCount } from "./lib/event-bus.js";
import { sendSuccess } from "./utils/api-response.js";
import { resolveCorsOrigin } from "./lib/cors-origin.js";

const API_PREFIX = "/api/v1";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: resolveCorsOrigin(),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(
    pinoHttp({
      logger,
      autoLogging: env.NODE_ENV !== "test",
    }),
  );

  const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(globalLimiter);

  app.get(`${API_PREFIX}/health`, (_req, res) => {
    sendSuccess(res, {
      status: "ok",
      network: env.STELLAR_NETWORK,
      redis: isRedisEnabled(),
      realtimeClients: sseClientCount(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use(`${API_PREFIX}/auth`, authRouter);
  app.use(`${API_PREFIX}/wallets`, walletRouter);
  app.use(`${API_PREFIX}/projects`, projectRouter);
  app.use(`${API_PREFIX}/marketplace`, marketplaceRouter);
  app.use(`${API_PREFIX}/investments`, investmentRouter);
  app.use(`${API_PREFIX}/admin`, adminRouter);
  app.use(`${API_PREFIX}/farms`, farmRouter);
  app.use(`${API_PREFIX}/updates`, updateRouter);
  app.use(`${API_PREFIX}/transactions`, transactionRouter);
  app.use(`${API_PREFIX}/portfolio`, portfolioRouter);
  app.use(`${API_PREFIX}/ai`, aiRouter);
  app.use(`${API_PREFIX}/analytics`, analyticsRouter);
  app.use(`${API_PREFIX}/transparency`, transparencyRouter);
  app.use(`${API_PREFIX}/notifications`, notificationRouter);
  app.use(`${API_PREFIX}/realtime`, realtimeRouter);

  app.use(errorHandler);

  return app;
}

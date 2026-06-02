import { Router } from "express";
import { optionalAuth, type RequestWithAuth } from "../../middleware/optional-auth.js";
import { verifyAccessToken } from "../../modules/auth/jwt.service.js";
import { registerSseClient, sseClientCount } from "../../lib/event-bus.js";
import { isRedisEnabled } from "../../lib/redis.js";
import { sendSuccess } from "../../utils/api-response.js";

export const realtimeRouter = Router();

realtimeRouter.get("/stream", optionalAuth, (req, res) => {
  let userId = (req as RequestWithAuth).auth?.sub;
  const qToken = typeof req.query.token === "string" ? req.query.token : undefined;
  if (!userId && qToken) {
    try {
      userId = verifyAccessToken(qToken).sub;
    } catch {
      /* public stream */
    }
  }
  registerSseClient(res, userId);
});

realtimeRouter.get("/status", (_req, res) => {
  sendSuccess(res, {
    sseClients: sseClientCount(),
    redis: isRedisEnabled(),
    transport: "sse",
  });
});

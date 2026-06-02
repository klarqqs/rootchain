import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  unreadCount,
} from "../../services/notification.service.js";
import { sendSuccess } from "../../utils/api-response.js";
import { requireParam } from "../../utils/params.js";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

notificationRouter.get("/mine", async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const unreadOnly = req.query.unread === "true";
    const notifications = await listNotifications(sub, unreadOnly);
    const unread = await unreadCount(sub);
    sendSuccess(res, { notifications, unread });
  } catch (e) {
    next(e);
  }
});

notificationRouter.patch("/:id/read", async (req, res, next) => {
  try {
    const { sub } = (req as unknown as AuthenticatedRequest).auth;
    await markNotificationRead(sub, requireParam(req, "id"));
    sendSuccess(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

notificationRouter.post("/read-all", async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    await markAllNotificationsRead(sub);
    sendSuccess(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

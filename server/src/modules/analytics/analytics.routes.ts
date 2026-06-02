import { Router } from "express";
import { requireAuth, requireAdmin, requireFarmer, requireInvestor, type AuthenticatedRequest } from "../../middleware/auth.js";
import { getAdminAnalytics, getFarmerAnalytics, getInvestorAnalytics } from "./analytics.service.js";
import { sendSuccess } from "../../utils/api-response.js";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

analyticsRouter.get("/investor", requireInvestor, async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const analytics = await getInvestorAnalytics(sub);
    sendSuccess(res, { analytics });
  } catch (e) {
    next(e);
  }
});

analyticsRouter.get("/farmer", requireFarmer, async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const analytics = await getFarmerAnalytics(sub);
    sendSuccess(res, { analytics });
  } catch (e) {
    next(e);
  }
});

analyticsRouter.get("/admin", requireAdmin, async (_req, res, next) => {
  try {
    const analytics = await getAdminAnalytics();
    sendSuccess(res, { analytics });
  } catch (e) {
    next(e);
  }
});

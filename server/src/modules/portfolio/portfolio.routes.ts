import { Router } from "express";
import { requireAuth, requireFarmer, requireInvestor, type AuthenticatedRequest } from "../../middleware/auth.js";
import { getFarmerDashboard, getInvestorPortfolio } from "./portfolio.service.js";
import { sendSuccess } from "../../utils/api-response.js";

export const portfolioRouter = Router();

portfolioRouter.use(requireAuth);

portfolioRouter.get("/investor", requireInvestor, async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const portfolio = await getInvestorPortfolio(sub);
    sendSuccess(res, { portfolio });
  } catch (e) {
    next(e);
  }
});

portfolioRouter.get("/farmer", requireFarmer, async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const dashboard = await getFarmerDashboard(sub);
    sendSuccess(res, { dashboard });
  } catch (e) {
    next(e);
  }
});

import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { listProjectTransactions, listUserTransactions } from "./transaction.service.js";
import { sendSuccess } from "../../utils/api-response.js";
import { requireParam } from "../../utils/params.js";

export const transactionRouter = Router();

transactionRouter.get("/project/:projectId", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 50);
    const transactions = await listProjectTransactions(requireParam(req, "projectId"), limit);
    sendSuccess(res, { transactions });
  } catch (e) {
    next(e);
  }
});

transactionRouter.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const limit = Number(req.query.limit ?? 50);
    const transactions = await listUserTransactions(sub, limit);
    sendSuccess(res, { transactions });
  } catch (e) {
    next(e);
  }
});

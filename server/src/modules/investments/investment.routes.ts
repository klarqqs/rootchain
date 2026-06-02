import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { requireAuth, requireInvestor, type AuthenticatedRequest } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import {
  attachPreparedXdr,
  confirmInvestmentTx,
  createInvestment,
  listUserInvestments,
} from "./investment.service.js";
import { sendSuccess } from "../../utils/api-response.js";
import { requireParam } from "../../utils/params.js";
import { antiFraudInvestment } from "../../middleware/fraud.js";

const investLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
});

const createSchema = z.object({
  projectId: z.string().uuid(),
  amount: z.number().positive(),
  walletAddress: z.string().optional(),
  preparedXdr: z.string().optional(),
});

const confirmSchema = z.object({
  stellarTxHash: z.string().min(10).max(128),
});

const xdrSchema = z.object({
  preparedXdr: z.string().min(10),
});

export const investmentRouter = Router();

investmentRouter.use(requireAuth, requireInvestor, investLimiter, antiFraudInvestment);

investmentRouter.get("/mine", async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const investments = await listUserInvestments(sub);
    sendSuccess(res, { investments });
  } catch (e) {
    next(e);
  }
});

investmentRouter.post("/", validateBody(createSchema), async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const result = await createInvestment(sub, req.body);
    sendSuccess(res, result, 201);
  } catch (e) {
    next(e);
  }
});

investmentRouter.patch(
  "/:id/prepared-xdr",
  validateBody(xdrSchema),
  async (req, res, next) => {
    try {
      const { sub } = (req as AuthenticatedRequest).auth;
      const result = await attachPreparedXdr(sub, requireParam(req, "id"), req.body.preparedXdr);
      sendSuccess(res, result);
    } catch (e) {
      next(e);
    }
  },
);

investmentRouter.post(
  "/:id/confirm",
  validateBody(confirmSchema),
  async (req, res, next) => {
    try {
      const { sub } = (req as AuthenticatedRequest).auth;
      const investment = await confirmInvestmentTx(
        sub,
        requireParam(req, "id"),
        req.body.stellarTxHash,
      );
      sendSuccess(res, { investment });
    } catch (e) {
      next(e);
    }
  },
);

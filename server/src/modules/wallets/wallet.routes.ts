import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import { getWallet, linkWallet } from "./wallet.service.js";
import { sendSuccess } from "../../utils/api-response.js";

const linkSchema = z.object({
  publicKey: z.string().min(56).max(56),
});

export const walletRouter = Router();

walletRouter.use(requireAuth);

walletRouter.get("/me", async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const wallet = await getWallet(sub);
    sendSuccess(res, { wallet });
  } catch (e) {
    next(e);
  }
});

walletRouter.put("/me", validateBody(linkSchema), async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const result = await linkWallet(sub, req.body.publicKey);
    sendSuccess(res, result);
  } catch (e) {
    next(e);
  }
});

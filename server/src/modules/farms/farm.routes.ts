import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireFarmer, type AuthenticatedRequest } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import { createFarm, listFarms } from "./farm.service.js";
import { sendSuccess } from "../../utils/api-response.js";

const createSchema = z.object({
  name: z.string().min(2).max(120),
  location: z.string().min(2).max(200),
  sizeHectares: z.number().positive().optional(),
});

export const farmRouter = Router();

farmRouter.use(requireAuth, requireFarmer);

farmRouter.get("/mine", async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const farms = await listFarms(sub);
    sendSuccess(res, { farms });
  } catch (e) {
    next(e);
  }
});

farmRouter.post("/", validateBody(createSchema), async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const farm = await createFarm(sub, req.body);
    sendSuccess(res, { farm }, 201);
  } catch (e) {
    next(e);
  }
});

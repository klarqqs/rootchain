import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireFarmer, type AuthenticatedRequest } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import { createProjectUpdate, listProjectUpdates } from "./update.service.js";
import { sendSuccess } from "../../utils/api-response.js";
import { requireParam } from "../../utils/params.js";

const createSchema = z.object({
  title: z.string().max(200).optional(),
  body: z.string().min(1).max(10000),
  updateType: z.enum(["GENERAL", "MILESTONE", "HARVEST"]).optional(),
  mediaUrl: z.string().url().optional(),
});

export const updateRouter = Router();

updateRouter.get("/project/:projectId", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 50);
    const updates = await listProjectUpdates(requireParam(req, "projectId"), limit);
    sendSuccess(res, { updates });
  } catch (e) {
    next(e);
  }
});

updateRouter.use(requireAuth, requireFarmer);

updateRouter.post("/project/:projectId", validateBody(createSchema), async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const update = await createProjectUpdate(sub, requireParam(req, "projectId"), req.body);
    sendSuccess(res, { update }, 201);
  } catch (e) {
    next(e);
  }
});

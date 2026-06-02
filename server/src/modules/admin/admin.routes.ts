import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin, type AuthenticatedRequest } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import {
  listAuditLogs,
  listPendingFarmers,
  listPendingProjects,
  reviewProject,
  verifyFarmer,
} from "./admin.service.js";
import { sendSuccess } from "../../utils/api-response.js";
import { requireParam } from "../../utils/params.js";

const reviewSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().max(2000).optional(),
});

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/farmers/pending", async (_req, res, next) => {
  try {
    const farmers = await listPendingFarmers();
    sendSuccess(res, { farmers });
  } catch (e) {
    next(e);
  }
});

adminRouter.patch(
  "/farmers/:id/verify",
  validateBody(reviewSchema),
  async (req, res, next) => {
    try {
      const { sub } = (req as AuthenticatedRequest).auth;
      const farmer = await verifyFarmer(sub, requireParam(req, "id"), req.body.decision, req.body.notes);
      sendSuccess(res, { farmer });
    } catch (e) {
      next(e);
    }
  },
);

adminRouter.get("/projects/pending", async (_req, res, next) => {
  try {
    const projects = await listPendingProjects();
    sendSuccess(res, { projects });
  } catch (e) {
    next(e);
  }
});

adminRouter.patch(
  "/projects/:id/review",
  validateBody(reviewSchema),
  async (req, res, next) => {
    try {
      const { sub } = (req as AuthenticatedRequest).auth;
      const project = await reviewProject(sub, requireParam(req, "id"), req.body.decision, req.body.notes);
      sendSuccess(res, { project });
    } catch (e) {
      next(e);
    }
  },
);

adminRouter.get("/audit-logs", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 100);
    const logs = await listAuditLogs(limit);
    sendSuccess(res, { logs });
  } catch (e) {
    next(e);
  }
});

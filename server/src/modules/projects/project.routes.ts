import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireFarmer, type AuthenticatedRequest } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import {
  addProjectMedia,
  createProject,
  getProjectById,
  listFarmerProjects,
  submitProjectForReview,
  updateProject,
} from "./project.service.js";
import { sendSuccess } from "../../utils/api-response.js";
import { requireParam } from "../../utils/params.js";

const mediaItemSchema = z.object({
  url: z.string().url(),
  kind: z.enum(["IMAGE", "VIDEO"]).optional(),
  caption: z.string().max(500).optional(),
});

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000),
  cropType: z.string().max(64).default("other"),
  location: z.string().min(2).max(200),
  targetAmount: z.number().positive(),
  expectedRoiPct: z.number().min(0).max(1000),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  aiScore: z.number().min(0).max(100).optional(),
  harvestTimeline: z.string().max(120).optional(),
  startDate: z.string(),
  endDate: z.string(),
  farmId: z.string().uuid().optional(),
  media: z.array(mediaItemSchema).max(20).optional(),
});

const updateSchema = createSchema.partial().omit({ media: true });

export const projectRouter = Router();

projectRouter.get("/:id", async (req, res, next) => {
  try {
    const project = await getProjectById(requireParam(req, "id"));
    sendSuccess(res, { project });
  } catch (e) {
    next(e);
  }
});

projectRouter.use(requireAuth);

projectRouter.get("/mine", requireFarmer, async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const projects = await listFarmerProjects(sub);
    sendSuccess(res, { projects });
  } catch (e) {
    next(e);
  }
});

projectRouter.post("/", requireFarmer, validateBody(createSchema), async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const project = await createProject(sub, req.body);
    sendSuccess(res, { project }, 201);
  } catch (e) {
    next(e);
  }
});

projectRouter.patch("/:id", requireFarmer, validateBody(updateSchema), async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const project = await updateProject(sub, requireParam(req, "id"), req.body);
    sendSuccess(res, { project });
  } catch (e) {
    next(e);
  }
});

projectRouter.post(
  "/:id/media",
  requireFarmer,
  validateBody(z.object({ media: z.array(mediaItemSchema).min(1).max(20) })),
  async (req, res, next) => {
    try {
      const { sub } = (req as AuthenticatedRequest).auth;
      const project = await addProjectMedia(sub, requireParam(req, "id"), req.body.media);
      sendSuccess(res, { project });
    } catch (e) {
      next(e);
    }
  },
);

projectRouter.post("/:id/submit", requireFarmer, async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const project = await submitProjectForReview(sub, requireParam(req, "id"));
    sendSuccess(res, { project });
  } catch (e) {
    next(e);
  }
});

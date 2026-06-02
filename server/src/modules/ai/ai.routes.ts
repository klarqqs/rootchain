import { Router } from "express";
import { getProjectRisk } from "./ai.service.js";
import { sendSuccess } from "../../utils/api-response.js";
import { requireParam } from "../../utils/params.js";

export const aiRouter = Router();

aiRouter.get("/projects/:id/risk", async (req, res, next) => {
  try {
    const assessment = await getProjectRisk(requireParam(req, "id"));
    sendSuccess(res, { assessment });
  } catch (e) {
    next(e);
  }
});

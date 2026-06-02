import { Router } from "express";
import { z } from "zod";
import { RiskLevel } from "@prisma/client";
import { listMarketplaceListings } from "./marketplace.service.js";
import { sendSuccess } from "../../utils/api-response.js";

const querySchema = z.object({
  search: z.string().optional(),
  cropType: z.string().optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  sort: z.enum(["newest", "funding", "roi", "ending"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(50).optional(),
});

export const marketplaceRouter = Router();

marketplaceRouter.get("/listings", async (req, res, next) => {
  try {
    const q = querySchema.parse(req.query);
    const result = await listMarketplaceListings({
      search: q.search,
      cropType: q.cropType,
      riskLevel: q.riskLevel as RiskLevel | undefined,
      sort: q.sort,
      page: q.page,
      pageSize: q.pageSize,
    });
    sendSuccess(res, result);
  } catch (e) {
    next(e);
  }
});

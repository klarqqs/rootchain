import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { listPublicActivity } from "../../services/activity.service.js";
import { sendSuccess } from "../../utils/api-response.js";
import { requireParam } from "../../utils/params.js";
import { requireAuth, requireAdmin, type AuthenticatedRequest } from "../../middleware/auth.js";

export const transparencyRouter = Router();

transparencyRouter.get("/activity", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 40);
    const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
    const rows = await listPublicActivity(limit, projectId);
    sendSuccess(res, {
      activities: rows.map((a) => ({
        id: a.id,
        type: a.type.toLowerCase(),
        title: a.title,
        summary: a.summary,
        projectId: a.projectId,
        projectTitle: a.project?.title,
        actorName: a.actor?.fullName,
        createdAt: a.createdAt.toISOString(),
        metadata: a.metadata,
      })),
    });
  } catch (e) {
    next(e);
  }
});

transparencyRouter.get("/projects/:id/verification", async (req, res, next) => {
  try {
    const projectId = requireParam(req, "id");
    const [project, txs, audits] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        include: { farmer: true, adminReviews: { orderBy: { createdAt: "desc" }, take: 5 } },
      }),
      prisma.transaction.findMany({
        where: { projectId, status: "CONFIRMED" },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { fullName: true } } },
      }),
      prisma.auditLog.findMany({
        where: { entityType: "project", entityId: projectId },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);
    sendSuccess(res, {
      project: project
        ? {
            id: project.id,
            title: project.title,
            status: project.status.toLowerCase(),
            farmerVerified: project.farmer.verificationStatus === "VERIFIED",
            aiScore: project.aiScore != null ? Number(project.aiScore) : null,
            trustScore: project.trustScore != null ? Number(project.trustScore) : null,
          }
        : null,
      onChainTransactions: txs.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        hash: t.stellarTxHash,
        investor: t.user.fullName,
        timestamp: t.createdAt.toISOString(),
      })),
      auditTrail: audits.map((l) => ({
        action: l.action,
        timestamp: l.createdAt.toISOString(),
        metadata: l.metadata,
      })),
      adminReviews: project?.adminReviews.map((r) => ({
        decision: r.decision.toLowerCase(),
        notes: r.notes,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    next(e);
  }
});

transparencyRouter.get("/audit-logs", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 100);
    const logs = await prisma.auditLog.findMany({
      take: Math.min(limit, 200),
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { email: true, fullName: true, role: true } } },
    });
    sendSuccess(res, { logs });
  } catch (e) {
    next(e);
  }
});

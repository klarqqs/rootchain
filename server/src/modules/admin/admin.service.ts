import {
  AdminReviewDecision,
  AdminReviewTarget,
  FarmerVerificationStatus,
  ProjectStatus,
} from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/api-response.js";
import { writeAuditLog } from "../../utils/audit.js";
import { recordActivity } from "../../services/activity.service.js";
import { createNotification } from "../../services/notification.service.js";
import { assessProject } from "../ai/ai.service.js";
import { publishEvent } from "../../lib/event-bus.js";

export async function listPendingFarmers() {
  return prisma.farmerProfile.findMany({
    where: { verificationStatus: { in: ["PENDING", "SUBMITTED"] } },
    include: {
      user: { select: { id: true, email: true, fullName: true, createdAt: true } },
      documents: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function verifyFarmer(
  adminId: string,
  farmerId: string,
  decision: "APPROVED" | "REJECTED",
  notes?: string,
) {
  const farmer = await prisma.farmerProfile.findUnique({ where: { id: farmerId } });
  if (!farmer) throw new AppError(404, "NOT_FOUND", "Farmer not found");

  const status: FarmerVerificationStatus =
    decision === "APPROVED" ? "VERIFIED" : "REJECTED";

  const updated = await prisma.$transaction(async (tx) => {
    const profile = await tx.farmerProfile.update({
      where: { id: farmerId },
      data: {
        verificationStatus: status,
        verifiedAt: decision === "APPROVED" ? new Date() : null,
      },
    });

    await tx.adminReview.create({
      data: {
        targetType: AdminReviewTarget.FARMER,
        farmerId,
        reviewerId: adminId,
        decision:
          decision === "APPROVED" ? AdminReviewDecision.APPROVED : AdminReviewDecision.REJECTED,
        notes: notes?.trim() || null,
      },
    });

    return profile;
  });

  await writeAuditLog({
    actorId: adminId,
    action: decision === "APPROVED" ? "FARMER_VERIFIED" : "FARMER_REJECTED",
    entityType: "farmer_profile",
    entityId: farmerId,
    metadata: { notes },
  });

  const farmerUser = await prisma.user.findUnique({ where: { id: updated.userId } });
  if (farmerUser) {
    await createNotification({
      userId: farmerUser.id,
      type: "ADMIN",
      title: decision === "APPROVED" ? "Verification approved" : "Verification declined",
      body:
        decision === "APPROVED"
          ? "Your farmer profile is verified. You may publish projects."
          : notes ?? "Please contact support for next steps.",
      email: { to: farmerUser.email },
    });
  }

  if (decision === "APPROVED") {
    await recordActivity({
      type: "FARMER_VERIFIED",
      title: `Farmer verified · ${updated.displayName}`,
      summary: "Institutional KYC gate cleared",
      actorId: adminId,
    });
  }

  await publishEvent({
    type: "admin_action",
    payload: { action: "farmer_verify", farmerId, decision },
    timestamp: new Date().toISOString(),
  });

  return updated;
}

export async function listPendingProjects() {
  return prisma.project.findMany({
    where: { status: ProjectStatus.PENDING_REVIEW },
    include: {
      farmer: { include: { user: { select: { email: true, fullName: true } } } },
      media: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function reviewProject(
  adminId: string,
  projectId: string,
  decision: "APPROVED" | "REJECTED",
  notes?: string,
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError(404, "NOT_FOUND", "Project not found");
  if (project.status !== ProjectStatus.PENDING_REVIEW) {
    throw new AppError(400, "INVALID_STATUS", "Project is not pending review");
  }

  const farmer = await prisma.farmerProfile.findUnique({ where: { id: project.farmerId } });
  if (!farmer || farmer.verificationStatus !== "VERIFIED") {
    throw new AppError(400, "FARMER_NOT_VERIFIED", "Farmer must be verified before approving projects");
  }

  const newStatus =
    decision === "APPROVED" ? ProjectStatus.ACTIVE : ProjectStatus.REJECTED;

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.project.update({
      where: { id: projectId },
      data: {
        status: newStatus,
        rejectionNote: decision === "REJECTED" ? notes?.trim() || "Rejected by admin" : null,
      },
    });

    await tx.adminReview.create({
      data: {
        targetType: AdminReviewTarget.PROJECT,
        projectId,
        reviewerId: adminId,
        decision:
          decision === "APPROVED" ? AdminReviewDecision.APPROVED : AdminReviewDecision.REJECTED,
        notes: notes?.trim() || null,
      },
    });

    return p;
  });

  await writeAuditLog({
    actorId: adminId,
    action: decision === "APPROVED" ? "PROJECT_APPROVED" : "PROJECT_REJECTED",
    entityType: "project",
    entityId: projectId,
    metadata: { notes },
  });

  const projectFull = await prisma.project.findUnique({
    where: { id: projectId },
    include: { farmer: { include: { user: true } } },
  });

  if (projectFull?.farmer.user) {
    await createNotification({
      userId: projectFull.farmer.user.id,
      type: "PROJECT",
      title: decision === "APPROVED" ? "Project live on marketplace" : "Project not approved",
      body:
        decision === "APPROVED"
          ? `${projectFull.title} is now accepting USDC investments.`
          : notes ?? "Revise and resubmit your project draft.",
      email: { to: projectFull.farmer.user.email },
    });
  }

  if (decision === "APPROVED") {
    await recordActivity({
      type: "PROJECT_APPROVED",
      title: `Project approved · ${updated.title}`,
      summary: "Now visible to institutional investors",
      projectId,
      actorId: adminId,
    });
    void assessProject(projectId, true).catch(() => undefined);

    const investors = await prisma.user.findMany({ where: { role: "INVESTOR" }, take: 200 });
    await Promise.all(
      investors.map((u) =>
        createNotification({
          userId: u.id,
          type: "PROJECT",
          title: "New listing",
          body: `${updated.title} is open for allocation.`,
          metadata: { projectId },
        }),
      ),
    );
  }

  await publishEvent({
    type: "admin_action",
    payload: { action: "project_review", projectId, decision },
    timestamp: new Date().toISOString(),
  });

  return updated;
}

export async function listAuditLogs(limit = 100) {
  return prisma.auditLog.findMany({
    take: Math.min(limit, 500),
    orderBy: { createdAt: "desc" },
    include: { actor: { select: { email: true, fullName: true, role: true } } },
  });
}

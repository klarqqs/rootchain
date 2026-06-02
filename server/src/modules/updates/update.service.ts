import { ProjectStatus, ProjectUpdateType } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/api-response.js";
import { recordActivity } from "../../services/activity.service.js";
import { createNotification } from "../../services/notification.service.js";
import { publishEvent } from "../../lib/event-bus.js";

export async function createProjectUpdate(
  userId: string,
  projectId: string,
  input: {
    title?: string;
    body: string;
    updateType?: "GENERAL" | "MILESTONE" | "HARVEST";
    mediaUrl?: string;
  },
) {
  const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
  if (!farmer) throw new AppError(403, "NOT_A_FARMER", "Farmer profile required");

  const project = await prisma.project.findFirst({
    where: { id: projectId, farmerId: farmer.id },
  });
  if (!project) throw new AppError(404, "NOT_FOUND", "Project not found");
  if (
    project.status !== ProjectStatus.ACTIVE &&
    project.status !== ProjectStatus.FUNDED
  ) {
    throw new AppError(400, "INVALID_STATUS", "Updates allowed only on active or funded projects");
  }

  const update = await prisma.projectUpdate.create({
    data: {
      projectId,
      authorId: userId,
      title: input.title?.trim() || null,
      body: input.body.trim(),
      updateType: (input.updateType ?? "GENERAL") as ProjectUpdateType,
      mediaUrl: input.mediaUrl?.trim() || null,
    },
  });

  await recordActivity({
    type: "PROJECT_UPDATE",
    title: input.title ?? `Farm update · ${project.title}`,
    summary: input.body.slice(0, 240),
    projectId,
    actorId: userId,
    metadata: { updateType: input.updateType, updateId: update.id },
  });

  const investors = await prisma.investment.findMany({
    where: { projectId, status: "CONFIRMED" },
    select: { userId: true },
    distinct: ["userId"],
  });
  for (const inv of investors) {
    await createNotification({
      userId: inv.userId,
      type: input.updateType === "MILESTONE" ? "MILESTONE" : "PROJECT",
      title: input.updateType === "MILESTONE" ? "Milestone reached" : "Farm update",
      body: `${project.title}: ${input.body.slice(0, 120)}`,
      metadata: { projectId, updateId: update.id },
    });
  }

  await publishEvent({
    type: "project_update",
    payload: { projectId, updateId: update.id, updateType: input.updateType },
    timestamp: new Date().toISOString(),
  });

  return {
    id: update.id,
    updateType: update.updateType.toLowerCase(),
    title: update.title,
    body: update.body,
    mediaUrl: update.mediaUrl,
    createdAt: update.createdAt.toISOString(),
  };
}

export async function listProjectUpdates(projectId: string, limit = 50) {
  const updates = await prisma.projectUpdate.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 100),
    include: {
      author: { select: { fullName: true, role: true } },
    },
  });

  return updates.map((u) => ({
    id: u.id,
    updateType: u.updateType.toLowerCase(),
    title: u.title,
    body: u.body,
    mediaUrl: u.mediaUrl,
    authorName: u.author.fullName,
    authorRole: u.author.role.toLowerCase(),
    createdAt: u.createdAt.toISOString(),
  }));
}

import type { ActivityType, ActivityVisibility, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { publishEvent, shouldEmitDeduped } from "../lib/event-bus.js";

export async function recordActivity(input: {
  type: ActivityType;
  title: string;
  summary: string;
  visibility?: ActivityVisibility;
  projectId?: string;
  actorId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  const activity = await prisma.platformActivity.create({
    data: {
      type: input.type,
      title: input.title,
      summary: input.summary,
      visibility: input.visibility ?? "PUBLIC",
      projectId: input.projectId,
      actorId: input.actorId,
      metadata: input.metadata,
    },
  });

  const dedupeKey = `${input.type}:${input.projectId ?? ""}:${input.title}`;
  if (shouldEmitDeduped(dedupeKey)) {
    await publishEvent({
      type: "activity",
      payload: {
        id: activity.id,
        activityType: activity.type,
        title: activity.title,
        summary: activity.summary,
        projectId: activity.projectId,
      },
      timestamp: new Date().toISOString(),
    });
  }

  return activity;
}

export async function listPublicActivity(limit = 50, projectId?: string) {
  return prisma.platformActivity.findMany({
    where: {
      visibility: "PUBLIC",
      ...(projectId ? { projectId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 100),
    include: {
      project: { select: { id: true, title: true } },
      actor: { select: { fullName: true, role: true } },
    },
  });
}

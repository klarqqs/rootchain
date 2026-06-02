import { MediaKind, ProjectStatus, RiskLevel } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/api-response.js";
import { writeAuditLog } from "../../utils/audit.js";
import { isPlaceholderText, mapProjectDetail } from "./project.mapper.js";

async function getFarmerForUser(userId: string) {
  const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
  if (!farmer) throw new AppError(403, "NOT_A_FARMER", "Farmer profile required");
  return farmer;
}

async function assertFarmOwnership(userId: string, farmId: string) {
  const farm = await prisma.farm.findFirst({ where: { id: farmId, ownerId: userId } });
  if (!farm) throw new AppError(400, "INVALID_FARM", "Farm not found or not owned by you");
  return farm;
}

export async function createProject(
  userId: string,
  input: {
    title: string;
    description: string;
    cropType: string;
    location: string;
    targetAmount: number;
    expectedRoiPct: number;
    riskLevel?: "LOW" | "MEDIUM" | "HIGH";
    aiScore?: number;
    harvestTimeline?: string;
    startDate: string;
    endDate: string;
    farmId?: string;
    media?: { url: string; kind?: "IMAGE" | "VIDEO"; caption?: string }[];
  },
) {
  const farmer = await getFarmerForUser(userId);
  if (farmer.verificationStatus !== "VERIFIED") {
    throw new AppError(403, "FARMER_NOT_VERIFIED", "Complete farmer verification before creating projects");
  }
  if (isPlaceholderText(input.title)) {
    throw new AppError(400, "INVALID_TITLE", "Project title not allowed");
  }
  if (input.farmId) await assertFarmOwnership(userId, input.farmId);

  const project = await prisma.project.create({
    data: {
      farmerId: farmer.id,
      farmId: input.farmId,
      title: input.title.trim(),
      description: input.description.trim(),
      cropType: input.cropType,
      location: input.location.trim(),
      targetAmount: input.targetAmount,
      expectedRoiPct: input.expectedRoiPct,
      riskLevel: (input.riskLevel ?? "MEDIUM") as RiskLevel,
      aiScore: input.aiScore,
      harvestTimeline: input.harvestTimeline?.trim() || null,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      status: ProjectStatus.DRAFT,
      media: input.media?.length
        ? {
            create: input.media.map((m, i) => ({
              url: m.url,
              kind: (m.kind ?? "IMAGE") as MediaKind,
              caption: m.caption,
              sortOrder: i,
            })),
          }
        : undefined,
    },
    include: { media: true, farmer: true },
  });

  await writeAuditLog({
    actorId: userId,
    action: "PROJECT_CREATED",
    entityType: "project",
    entityId: project.id,
  });

  return mapProjectDetail(project);
}

export async function updateProject(
  userId: string,
  projectId: string,
  input: Partial<{
    title: string;
    description: string;
    cropType: string;
    location: string;
    targetAmount: number;
    expectedRoiPct: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    aiScore: number;
    harvestTimeline: string;
    startDate: string;
    endDate: string;
  }>,
) {
  const farmer = await getFarmerForUser(userId);
  const existing = await prisma.project.findFirst({
    where: { id: projectId, farmerId: farmer.id },
  });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Project not found");
  if (existing.status !== ProjectStatus.DRAFT && existing.status !== ProjectStatus.REJECTED) {
    throw new AppError(400, "INVALID_STATUS", "Only draft or rejected projects can be edited");
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description.trim() } : {}),
      ...(input.cropType !== undefined ? { cropType: input.cropType } : {}),
      ...(input.location !== undefined ? { location: input.location.trim() } : {}),
      ...(input.targetAmount !== undefined ? { targetAmount: input.targetAmount } : {}),
      ...(input.expectedRoiPct !== undefined ? { expectedRoiPct: input.expectedRoiPct } : {}),
      ...(input.riskLevel !== undefined ? { riskLevel: input.riskLevel as RiskLevel } : {}),
      ...(input.aiScore !== undefined ? { aiScore: input.aiScore } : {}),
      ...(input.harvestTimeline !== undefined ? { harvestTimeline: input.harvestTimeline } : {}),
      ...(input.startDate !== undefined ? { startDate: new Date(input.startDate) } : {}),
      ...(input.endDate !== undefined ? { endDate: new Date(input.endDate) } : {}),
      ...(existing.status === ProjectStatus.REJECTED ? { status: ProjectStatus.DRAFT } : {}),
    },
    include: { media: true, farmer: true },
  });

  return mapProjectDetail(updated);
}

export async function addProjectMedia(
  userId: string,
  projectId: string,
  items: { url: string; kind?: "IMAGE" | "VIDEO"; caption?: string }[],
) {
  const farmer = await getFarmerForUser(userId);
  const project = await prisma.project.findFirst({
    where: { id: projectId, farmerId: farmer.id },
    include: { media: true },
  });
  if (!project) throw new AppError(404, "NOT_FOUND", "Project not found");
  if (project.status !== ProjectStatus.DRAFT && project.status !== ProjectStatus.REJECTED) {
    throw new AppError(400, "INVALID_STATUS", "Cannot add media after submission");
  }

  const startOrder = project.media.length;
  await prisma.projectMedia.createMany({
    data: items.map((m, i) => ({
      projectId,
      url: m.url,
      kind: (m.kind ?? "IMAGE") as MediaKind,
      caption: m.caption,
      sortOrder: startOrder + i,
    })),
  });

  return getProjectById(projectId);
}

export async function submitProjectForReview(userId: string, projectId: string) {
  const farmer = await getFarmerForUser(userId);
  const project = await prisma.project.findFirst({
    where: { id: projectId, farmerId: farmer.id },
    include: { media: true },
  });
  if (!project) throw new AppError(404, "NOT_FOUND", "Project not found");
  if (project.status !== ProjectStatus.DRAFT && project.status !== ProjectStatus.REJECTED) {
    throw new AppError(400, "INVALID_STATUS", "Only draft projects can be submitted");
  }
  if (project.media.length === 0) {
    throw new AppError(400, "MEDIA_REQUIRED", "Add at least one farm image before submitting");
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { status: ProjectStatus.PENDING_REVIEW, rejectionNote: null },
    include: { media: true, farmer: true },
  });

  await writeAuditLog({
    actorId: userId,
    action: "PROJECT_SUBMITTED",
    entityType: "project",
    entityId: projectId,
  });

  return mapProjectDetail(updated);
}

export async function listFarmerProjects(userId: string) {
  const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
  if (!farmer) return [];

  const projects = await prisma.project.findMany({
    where: { farmerId: farmer.id },
    orderBy: { createdAt: "desc" },
    include: { media: true, farmer: true },
  });

  return projects.map(mapProjectDetail);
}

export async function getProjectById(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      farmer: { include: { user: { select: { fullName: true, email: true } } } },
      updates: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!project) return null;
  return {
    ...mapProjectDetail(project),
    updates: project.updates.map((u) => ({
      id: u.id,
      updateType: u.updateType.toLowerCase(),
      title: u.title,
      body: u.body,
      mediaUrl: u.mediaUrl,
      createdAt: u.createdAt.toISOString(),
    })),
  };
}

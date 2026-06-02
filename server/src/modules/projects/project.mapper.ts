import type { MediaKind, Prisma, Project, ProjectMedia, RiskLevel } from "@prisma/client";

const PLACEHOLDER = /\b(test|demo|placeholder|mock|fake|lorem)\b/i;

export function isPlaceholderText(text: string): boolean {
  return PLACEHOLDER.test(text);
}

export function mapProjectMedia(m: ProjectMedia) {
  return {
    id: m.id,
    kind: m.kind.toLowerCase(),
    url: m.url,
    mimeType: m.mimeType,
    caption: m.caption,
    sortOrder: m.sortOrder,
  };
}

export function mapProjectDetail(
  p: Project & {
    media: ProjectMedia[];
    farmer?: { displayName: string; location: string; verificationStatus: string };
  },
) {
  const target = Number(p.targetAmount);
  const raised = Number(p.raisedAmount);
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    cropType: p.cropType,
    location: p.location,
    targetAmount: target,
    raisedAmount: raised,
    expectedRoiPct: Number(p.expectedRoiPct),
    riskLevel: p.riskLevel.toLowerCase(),
    aiScore: p.aiScore != null ? Number(p.aiScore) : null,
    harvestTimeline: p.harvestTimeline,
    startDate: p.startDate.toISOString().slice(0, 10),
    endDate: p.endDate.toISOString().slice(0, 10),
    status: p.status.toLowerCase(),
    fundingProgressPct: target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0,
    verificationStatus: p.status === "ACTIVE" ? "verified" : "pending",
    media: p.media.map(mapProjectMedia),
    farmer: p.farmer
      ? {
          name: p.farmer.displayName,
          location: p.farmer.location,
          verificationStatus: p.farmer.verificationStatus.toLowerCase(),
        }
      : undefined,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export function mapListingRow(
  p: Project & {
    farmer: { id: string; displayName: string; location: string };
    media: ProjectMedia[];
    investments: { userId: string }[];
  },
) {
  const target = Number(p.targetAmount);
  const raised = Number(p.raisedAmount);
  const start = p.startDate.getTime();
  const end = p.endDate.getTime();
  const durationDays = Math.max(1, Math.round((end - start) / 86_400_000) + 1);
  const cover = p.media[0];

  return {
    id: p.id,
    title: p.title,
    description: p.description,
    cropType: p.cropType,
    location: p.location || p.farmer.location,
    targetAmount: target,
    raisedAmount: raised,
    expectedRoiPct: Number(p.expectedRoiPct),
    riskLevel: p.riskLevel.toLowerCase() as "low" | "medium" | "high",
    aiScore: p.aiScore != null ? Number(p.aiScore) : null,
    harvestTimeline: p.harvestTimeline,
    startDate: p.startDate.toISOString().slice(0, 10),
    endDate: p.endDate.toISOString().slice(0, 10),
    status: "active" as const,
    fundingProgressPct: target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0,
    durationDays,
    coverImageUrl: cover?.kind === "IMAGE" ? cover.url : p.media.find((m) => m.kind === "IMAGE")?.url ?? null,
    coverVideoUrl: p.media.find((m) => m.kind === "VIDEO")?.url ?? null,
    farmer: {
      id: p.farmer.id,
      name: p.farmer.displayName,
      location: p.farmer.location,
      verification_status: "verified" as const,
    },
    investorCount: new Set(p.investments.map((i) => i.userId)).size,
  };
}

export type MarketplaceQuery = {
  search?: string;
  cropType?: string;
  riskLevel?: RiskLevel;
  sort?: "newest" | "funding" | "roi" | "ending";
  page?: number;
  pageSize?: number;
};

export function buildMarketplaceWhere(q: MarketplaceQuery): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {
    status: "ACTIVE",
    farmer: { verificationStatus: "VERIFIED" },
  };
  if (q.cropType && q.cropType !== "all") {
    where.cropType = { equals: q.cropType, mode: "insensitive" };
  }
  if (q.riskLevel) {
    where.riskLevel = q.riskLevel;
  }
  if (q.search?.trim()) {
    const s = q.search.trim();
    where.OR = [
      { title: { contains: s, mode: "insensitive" } },
      { description: { contains: s, mode: "insensitive" } },
      { location: { contains: s, mode: "insensitive" } },
      { cropType: { contains: s, mode: "insensitive" } },
      { farmer: { displayName: { contains: s, mode: "insensitive" } } },
    ];
  }
  return where;
}

export function marketplaceOrderBy(
  sort: MarketplaceQuery["sort"],
): Prisma.ProjectOrderByWithRelationInput[] {
  switch (sort) {
    case "funding":
      return [{ raisedAmount: "desc" }];
    case "roi":
      return [{ expectedRoiPct: "desc" }];
    case "ending":
      return [{ endDate: "asc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

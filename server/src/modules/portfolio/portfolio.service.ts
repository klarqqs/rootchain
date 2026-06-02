import { InvestmentStatus, ProjectStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/api-response.js";

export async function getInvestorPortfolio(userId: string) {
  const investments = await prisma.investment.findMany({
    where: { userId, status: InvestmentStatus.CONFIRMED },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          cropType: true,
          location: true,
          status: true,
          expectedRoiPct: true,
          targetAmount: true,
          raisedAmount: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalInvested = investments.reduce((s, i) => s + Number(i.amount), 0);
  const projectedReturns = investments.reduce(
    (s, i) => s + Number(i.amount) * (1 + Number(i.project.expectedRoiPct) / 100),
    0,
  );

  const activeFarms = investments.filter(
    (i) =>
      i.project.status === ProjectStatus.ACTIVE || i.project.status === ProjectStatus.FUNDED,
  );

  const recent = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { project: { select: { title: true } } },
  });

  return {
    summary: {
      totalInvested,
      projectedReturns,
      activePositions: activeFarms.length,
      projectedRoiPct:
        totalInvested > 0
          ? Math.round(((projectedReturns - totalInvested) / totalInvested) * 100)
          : 0,
    },
    positions: investments.map((i) => ({
      investmentId: i.id,
      projectId: i.projectId,
      title: i.project.title,
      cropType: i.project.cropType,
      location: i.project.location,
      amount: Number(i.amount),
      expectedRoiPct: Number(i.project.expectedRoiPct),
      projectedReturn: Number(i.amount) * (1 + Number(i.project.expectedRoiPct) / 100),
      fundingProgressPct:
        Number(i.project.targetAmount) > 0
          ? Math.min(
              100,
              Math.round(
                (Number(i.project.raisedAmount) / Number(i.project.targetAmount)) * 100,
              ),
            )
          : 0,
      status: i.project.status.toLowerCase(),
      stellarTxHash: i.stellarTxHash,
      investedAt: i.createdAt.toISOString(),
    })),
    recentActivity: recent.map((t) => ({
      id: t.id,
      type: "investment",
      projectTitle: t.project.title,
      amount: Number(t.amount),
      status: t.status.toLowerCase(),
      stellarTxHash: t.stellarTxHash,
      timestamp: t.createdAt.toISOString(),
    })),
  };
}

export async function getFarmerDashboard(userId: string) {
  const farmer = await prisma.farmerProfile.findUnique({
    where: { userId },
    include: {
      projects: {
        include: {
          media: { take: 1, orderBy: { sortOrder: "asc" } },
          investments: { where: { status: InvestmentStatus.CONFIRMED } },
          updates: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!farmer) throw new AppError(403, "NOT_A_FARMER", "Farmer profile required");

  const projects = farmer.projects;
  const totalRaised = projects.reduce((s, p) => s + Number(p.raisedAmount), 0);
  const totalTarget = projects.reduce((s, p) => s + Number(p.targetAmount), 0);
  const investorIds = new Set<string>();
  for (const p of projects) {
    for (const inv of p.investments) investorIds.add(inv.userId);
  }

  const milestones = projects.flatMap((p) =>
    (p.updates[0]
      ? [
          {
            projectId: p.id,
            projectTitle: p.title,
            lastUpdate: p.updates[0].createdAt.toISOString(),
            updateType: p.updates[0].updateType.toLowerCase(),
          },
        ]
      : []),
  );

  return {
    summary: {
      verificationStatus: farmer.verificationStatus.toLowerCase(),
      projectCount: projects.length,
      activeProjects: projects.filter((p) => p.status === ProjectStatus.ACTIVE).length,
      totalRaised,
      totalTarget,
      uniqueInvestors: investorIds.size,
      fundingRatePct:
        totalTarget > 0 ? Math.min(100, Math.round((totalRaised / totalTarget) * 100)) : 0,
    },
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status.toLowerCase(),
      cropType: p.cropType,
      targetAmount: Number(p.targetAmount),
      raisedAmount: Number(p.raisedAmount),
      expectedRoiPct: Number(p.expectedRoiPct),
      investorCount: new Set(p.investments.map((i) => i.userId)).size,
      coverUrl: p.media[0]?.url ?? null,
      lastUpdateAt: p.updates[0]?.createdAt.toISOString() ?? null,
    })),
    milestones,
    withdrawals: {
      available: totalRaised,
      pending: 0,
      note: "Withdrawal rail connects to escrow release in Phase 3",
    },
  };
}

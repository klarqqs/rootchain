import { prisma } from "../../lib/prisma.js";
import { getCachedOrCompute } from "../../lib/event-bus.js";

export async function getInvestorAnalytics(userId: string) {
  return getCachedOrCompute(`analytics:investor:${userId}`, 45, async () => {
    const investments = await prisma.investment.findMany({
      where: { userId, status: "CONFIRMED" },
      include: {
        project: {
          select: { cropType: true, riskLevel: true, location: true, title: true, expectedRoiPct: true },
        },
      },
    });

    const total = investments.reduce((s, i) => s + Number(i.amount), 0);
    const byCrop = new Map<string, number>();
    const byRisk = new Map<string, number>();
    const roiSeries: { label: string; projected: number; invested: number }[] = [];

    for (const inv of investments) {
      const amt = Number(inv.amount);
      byCrop.set(inv.project.cropType, (byCrop.get(inv.project.cropType) ?? 0) + amt);
      const risk = inv.project.riskLevel.toLowerCase();
      byRisk.set(risk, (byRisk.get(risk) ?? 0) + amt);
      const roi = Number(inv.project.expectedRoiPct ?? 0);
      roiSeries.push({
        label: inv.project.title.slice(0, 24),
        projected: amt * (1 + roi / 100),
        invested: amt,
      });
    }

    const diversificationScore =
      byCrop.size === 0 ? 0 : Math.min(100, byCrop.size * 22 + (byRisk.size > 1 ? 15 : 0));

    return {
      totalInvested: total,
      positionCount: investments.length,
      diversificationScore,
      cropAllocation: [...byCrop.entries()].map(([crop, amount]) => ({
        crop,
        amount,
        pct: total > 0 ? Math.round((amount / total) * 100) : 0,
      })),
      riskAllocation: [...byRisk.entries()].map(([risk, amount]) => ({
        risk,
        amount,
        pct: total > 0 ? Math.round((amount / total) * 100) : 0,
      })),
      roiSeries: roiSeries.slice(0, 12),
    };
  });
}

export async function getFarmerAnalytics(userId: string) {
  return getCachedOrCompute(`analytics:farmer:${userId}`, 45, async () => {
    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId },
      include: {
        projects: {
          include: {
            investments: { where: { status: "CONFIRMED" } },
            updates: true,
          },
        },
      },
    });
    if (!farmer) return null;

    const projects = farmer.projects;
    const fundingSpeed = projects.map((p) => {
      const days = Math.max(1, (Date.now() - p.createdAt.getTime()) / 86_400_000);
      const pct = Number(p.targetAmount) > 0 ? (Number(p.raisedAmount) / Number(p.targetAmount)) * 100 : 0;
      return {
        projectId: p.id,
        title: p.title,
        daysActive: Math.round(days),
        fundingPct: Math.round(pct),
        velocityPerDay: pct / days,
      };
    });

    const milestoneRate =
      projects.length === 0
        ? 0
        : Math.round(
            (projects.filter((p) => p.updates.some((u) => u.updateType === "MILESTONE")).length /
              projects.length) *
              100,
          );

    const investorEngagement = projects.reduce((s, p) => {
      const ids = new Set(p.investments.map((i) => i.userId));
      return s + ids.size;
    }, 0);

    return {
      projectCount: projects.length,
      investorEngagement,
      milestoneCompletionPct: milestoneRate,
      fundingSpeed,
      performance: projects.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status.toLowerCase(),
        raised: Number(p.raisedAmount),
        target: Number(p.targetAmount),
        updateCount: p.updates.length,
      })),
    };
  });
}

export async function getAdminAnalytics() {
  return getCachedOrCompute("analytics:admin", 30, async () => {
    const [
      userCount,
      farmerCount,
      investorCount,
      activeProjects,
      volume,
      pendingFarmers,
      pendingProjects,
      recentInvestments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "FARMER" } }),
      prisma.user.count({ where: { role: "INVESTOR" } }),
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.investment.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.farmerProfile.count({
        where: { verificationStatus: { in: ["PENDING", "SUBMITTED"] } },
      }),
      prisma.project.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.investment.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          status: "CONFIRMED",
        },
      }),
    ]);

    const fraudSignals = {
      highVelocityInvestments: recentInvestments > 50 ? "elevated" : "normal",
      pendingReviewBacklog: pendingProjects > 20 ? "elevated" : "normal",
      unverifiedFarmers: pendingFarmers > 15 ? "elevated" : "normal",
    };

    return {
      users: { total: userCount, farmers: farmerCount, investors: investorCount },
      projects: { active: activeProjects, pendingReview: pendingProjects },
      volume: {
        confirmedInvestments: volume._count,
        totalUsdc: Number(volume._sum.amount ?? 0),
        last24h: recentInvestments,
      },
      verification: { pendingFarmers },
      fraudSignals,
    };
  });
}

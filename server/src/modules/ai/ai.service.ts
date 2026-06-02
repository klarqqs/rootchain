import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/api-response.js";
import { computeRiskAssessment, type RiskAssessment } from "../../ai/risk-engine.js";
import { getCachedOrCompute } from "../../lib/event-bus.js";
import { cacheDel } from "../../lib/redis.js";

export async function assessProject(projectId: string, persist = true): Promise<RiskAssessment> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      farmer: true,
      investments: { where: { status: "CONFIRMED" }, select: { userId: true, amount: true, createdAt: true } },
    },
  });
  if (!project) throw new AppError(404, "NOT_FOUND", "Project not found");

  const ageDays = Math.max(
    1,
    Math.round((Date.now() - project.createdAt.getTime()) / 86_400_000),
  );
  const fundingVelocityPct =
    ageDays > 0 ? (Number(project.raisedAmount) / Number(project.targetAmount || 1) / ageDays) * 100 : 0;

  const assessment = computeRiskAssessment({
    projectId: project.id,
    title: project.title,
    cropType: project.cropType,
    location: project.location || project.farmer.location,
    targetAmount: Number(project.targetAmount),
    expectedRoiPct: Number(project.expectedRoiPct),
    riskLevel: project.riskLevel,
    farmerVerificationStatus: project.farmer.verificationStatus,
    farmerDisplayName: project.farmer.displayName,
    raisedAmount: Number(project.raisedAmount),
    investorCount: new Set(project.investments.map((i) => i.userId)).size,
    projectAgeDays: ageDays,
    fundingVelocityPct,
  });

  if (persist) {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        aiScore: assessment.riskScore,
        trustScore: assessment.trustScore,
        predictedRoiPct: assessment.predictedRoiPct,
        aiFactors: assessment as object,
      },
    });
    await cacheDel(`marketplace:listings`);
  }

  return assessment;
}

export async function getProjectRisk(projectId: string): Promise<RiskAssessment> {
  return getCachedOrCompute(`ai:risk:${projectId}`, 120, () => assessProject(projectId, true));
}

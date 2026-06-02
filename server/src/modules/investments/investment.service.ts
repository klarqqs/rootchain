import { InvestmentStatus, ProjectStatus, TransactionStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/api-response.js";
import { writeAuditLog } from "../../utils/audit.js";
import { describeEscrowIntent } from "../../stellar/escrow.js";
import { verifyUsdcInvestmentPayment } from "../../stellar/verify.js";
import { checkDuplicateInvestment } from "../../middleware/fraud.js";
import { recordActivity } from "../../services/activity.service.js";
import { createNotification } from "../../services/notification.service.js";
import { publishEvent } from "../../lib/event-bus.js";
import { assessProject } from "../ai/ai.service.js";

export async function createInvestment(
  userId: string,
  input: { projectId: string; amount: number; walletAddress?: string; preparedXdr?: string },
) {
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    include: { farmer: true },
  });

  if (!project || project.status !== ProjectStatus.ACTIVE) {
    throw new AppError(400, "PROJECT_NOT_ACTIVE", "Project is not open for investment");
  }
  if (project.farmer.verificationStatus !== "VERIFIED") {
    throw new AppError(400, "FARMER_NOT_VERIFIED", "Farmer is not verified");
  }

  const amount = input.amount;
  if (amount <= 0) throw new AppError(400, "INVALID_AMOUNT", "Amount must be positive");

  await checkDuplicateInvestment(userId, input.projectId, amount);

  const target = Number(project.targetAmount);
  const raised = Number(project.raisedAmount);
  if (raised + amount > target * 1.001) {
    throw new AppError(400, "FUNDING_CAP", "Investment exceeds remaining funding target");
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  const walletAddress = input.walletAddress?.trim() || wallet?.publicKey || null;
  if (!walletAddress) {
    throw new AppError(400, "WALLET_REQUIRED", "Connect a Stellar wallet before investing");
  }

  const investment = await prisma.$transaction(async (tx) => {
    const inv = await tx.investment.create({
      data: {
        userId,
        projectId: input.projectId,
        amount,
        status: InvestmentStatus.PENDING,
        walletAddress,
        preparedXdr: input.preparedXdr ?? null,
      },
    });

    await tx.transaction.create({
      data: {
        userId,
        projectId: input.projectId,
        investmentId: inv.id,
        amount,
        status: TransactionStatus.PENDING,
        walletAddress,
        preparedXdr: input.preparedXdr ?? null,
      },
    });

    return inv;
  });

  const escrow = describeEscrowIntent({
    projectId: input.projectId,
    amountUsdc: amount,
    investorPublicKey: walletAddress,
  });

  await writeAuditLog({
    actorId: userId,
    action: "INVESTMENT_CREATED",
    entityType: "investment",
    entityId: investment.id,
    metadata: { projectId: input.projectId, amount },
  });

  return { investment, escrow };
}

export async function attachPreparedXdr(
  userId: string,
  investmentId: string,
  preparedXdr: string,
) {
  const investment = await prisma.investment.findFirst({
    where: { id: investmentId, userId },
  });
  if (!investment) throw new AppError(404, "NOT_FOUND", "Investment not found");
  if (investment.status !== InvestmentStatus.PENDING) {
    throw new AppError(400, "INVALID_STATUS", "Investment is not pending");
  }

  await prisma.investment.update({
    where: { id: investmentId },
    data: { preparedXdr },
  });
  await prisma.transaction.updateMany({
    where: { investmentId },
    data: { preparedXdr },
  });

  return { ok: true };
}

export async function listUserInvestments(userId: string) {
  const rows = await prisma.investment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          status: true,
          cropType: true,
          expectedRoiPct: true,
          location: true,
        },
      },
      transaction: true,
    },
  });

  return rows.map((inv) => ({
    id: inv.id,
    projectId: inv.projectId,
    amount: Number(inv.amount),
    status: inv.status.toLowerCase(),
    stellarTxHash: inv.stellarTxHash,
    walletAddress: inv.walletAddress,
    createdAt: inv.createdAt.toISOString(),
    project: {
      ...inv.project,
      expectedRoiPct: Number(inv.project.expectedRoiPct),
      status: inv.project.status.toLowerCase(),
    },
    projectedReturn: Number(inv.amount) * (1 + Number(inv.project.expectedRoiPct) / 100),
  }));
}

export async function confirmInvestmentTx(
  userId: string,
  investmentId: string,
  stellarTxHash: string,
) {
  const investment = await prisma.investment.findFirst({
    where: { id: investmentId, userId },
    include: { project: true },
  });
  if (!investment) throw new AppError(404, "NOT_FOUND", "Investment not found");
  if (investment.status !== InvestmentStatus.PENDING) {
    throw new AppError(400, "INVALID_STATUS", "Investment is not pending");
  }

  const hash = stellarTxHash.trim();
  if (hash.length < 10) throw new AppError(400, "INVALID_TX_HASH", "Invalid transaction hash");

  const duplicate = await prisma.investment.findFirst({
    where: { stellarTxHash: hash, id: { not: investmentId } },
  });
  if (duplicate) {
    throw new AppError(409, "DUPLICATE_TX", "Transaction hash already used");
  }

  const walletAddress = investment.walletAddress ?? "";
  const verification = await verifyUsdcInvestmentPayment({
    stellarTxHash: hash,
    expectedSource: walletAddress,
    expectedAmount: Number(investment.amount),
    projectId: investment.projectId,
  });

  if (!verification.valid) {
    throw new AppError(400, "TX_VERIFICATION_FAILED", verification.reason ?? "Invalid payment");
  }

  const target = Number(investment.project.targetAmount);
  const raised = Number(investment.project.raisedAmount);
  const newRaised = raised + Number(investment.amount);
  const newStatus =
    newRaised >= target ? ProjectStatus.FUNDED : investment.project.status;

  const updated = await prisma.$transaction(async (tx) => {
    const inv = await tx.investment.update({
      where: { id: investmentId },
      data: {
        status: InvestmentStatus.CONFIRMED,
        stellarTxHash: hash,
      },
    });

    await tx.transaction.updateMany({
      where: { investmentId },
      data: { status: TransactionStatus.CONFIRMED, stellarTxHash: hash },
    });

    await tx.project.update({
      where: { id: inv.projectId },
      data: {
        raisedAmount: { increment: inv.amount },
        status: newStatus,
      },
    });

    return inv;
  });

  await writeAuditLog({
    actorId: userId,
    action: "INVESTMENT_CONFIRMED",
    entityType: "investment",
    entityId: investmentId,
    metadata: { stellarTxHash: hash },
  });

  const project = await prisma.project.findUnique({
    where: { id: updated.projectId },
    include: { farmer: { include: { user: true } } },
  });
  const investor = await prisma.user.findUnique({ where: { id: userId } });

  if (project) {
    const pct =
      Number(project.targetAmount) > 0
        ? Math.round((newRaised / Number(project.targetAmount)) * 100)
        : 0;

    await recordActivity({
      type: "INVESTMENT_CONFIRMED",
      title: `Investment confirmed · ${project.title}`,
      summary: `${investor?.fullName ?? "Investor"} allocated ${Number(updated.amount)} USDC`,
      projectId: project.id,
      actorId: userId,
      metadata: { stellarTxHash: hash, amount: Number(updated.amount) },
    });

    if (newStatus === ProjectStatus.FUNDED) {
      await recordActivity({
        type: "PROJECT_FUNDED",
        title: `${project.title} fully funded`,
        summary: `Target reached at ${pct}% on-chain verification`,
        projectId: project.id,
      });
    } else {
      await recordActivity({
        type: "FUNDING_PROGRESS",
        title: `${project.title} · ${pct}% funded`,
        summary: `${formatUsd(newRaised)} raised of ${formatUsd(Number(project.targetAmount))}`,
        projectId: project.id,
      });
    }

    await publishEvent({
      type: "funding_progress",
      payload: { projectId: project.id, raised: newRaised, target: Number(project.targetAmount), pct },
      timestamp: new Date().toISOString(),
    });

    if (investor) {
      await createNotification({
        userId,
        type: "INVESTMENT",
        title: "Investment confirmed on-chain",
        body: `Your ${Number(updated.amount)} USDC investment in ${project.title} is confirmed.`,
        metadata: { stellarTxHash: hash, projectId: project.id },
        email: { to: investor.email },
      });
    }

    if (project.farmer.user) {
      await createNotification({
        userId: project.farmer.user.id,
        type: "INVESTMENT",
        title: "New capital received",
        body: `${Number(updated.amount)} USDC invested in ${project.title}.`,
        metadata: { projectId: project.id },
        email: { to: project.farmer.user.email },
      });
    }

    void assessProject(project.id, true).catch(() => undefined);
  }

  return updated;
}

function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

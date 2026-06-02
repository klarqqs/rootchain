import { prisma } from "../../lib/prisma.js";

export async function listProjectTransactions(projectId: string, limit = 50) {
  const rows = await prisma.transaction.findMany({
    where: { projectId, status: "CONFIRMED" },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 200),
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      investment: { select: { id: true, status: true } },
    },
  });

  return rows.map((t) => ({
    id: t.id,
    investor: {
      id: t.user.id,
      name: t.user.fullName,
      emailMasked: maskEmail(t.user.email),
    },
    amount: Number(t.amount),
    stellarTxHash: t.stellarTxHash,
    walletAddress: t.walletAddress,
    status: t.status.toLowerCase(),
    timestamp: t.createdAt.toISOString(),
  }));
}

export async function listUserTransactions(userId: string, limit = 50) {
  const rows = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 200),
    include: {
      project: { select: { id: true, title: true, cropType: true } },
    },
  });

  return rows.map((t) => ({
    id: t.id,
    projectId: t.projectId,
    projectTitle: t.project.title,
    cropType: t.project.cropType,
    amount: Number(t.amount),
    stellarTxHash: t.stellarTxHash,
    status: t.status.toLowerCase(),
    timestamp: t.createdAt.toISOString(),
  }));
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user.slice(0, 2)}***@${domain}`;
}

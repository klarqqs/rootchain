import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/api-response.js";
import type { AuthenticatedRequest } from "./auth.js";

const investWindows = new Map<string, number[]>();

export function antiFraudInvestment(req: Request, _res: Response, next: NextFunction): void {
  const auth = (req as AuthenticatedRequest).auth;
  if (!auth) {
    next();
    return;
  }

  const now = Date.now();
  const key = auth.sub;
  const window = investWindows.get(key) ?? [];
  const recent = window.filter((t) => now - t < 60_000);
  if (recent.length >= 10) {
    next(new AppError(429, "FRAUD_VELOCITY", "Too many investment attempts. Try again shortly."));
    return;
  }
  recent.push(now);
  investWindows.set(key, recent);
  next();
}

export async function checkDuplicateInvestment(
  userId: string,
  projectId: string,
  amount: number,
): Promise<void> {
  const since = new Date(Date.now() - 5 * 60_000);
  const dup = await prisma.investment.findFirst({
    where: {
      userId,
      projectId,
      amount,
      status: "PENDING",
      createdAt: { gte: since },
    },
  });
  if (dup) {
    throw new AppError(409, "DUPLICATE_INVESTMENT", "Duplicate pending investment detected");
  }
}

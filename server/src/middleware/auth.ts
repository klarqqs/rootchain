import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { verifyAccessToken, type AccessTokenPayload } from "../modules/auth/jwt.service.js";
import { AppError } from "../utils/api-response.js";

export interface AuthenticatedRequest extends Request {
  auth: AccessTokenPayload;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    return;
  }
  try {
    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).auth = payload;
    next();
  } catch {
    next(new AppError(401, "INVALID_TOKEN", "Invalid or expired access token"));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth || !roles.includes(auth.role)) {
      next(new AppError(403, "FORBIDDEN", "Insufficient permissions"));
      return;
    }
    next();
  };
}

export const requireAdmin = requireRole("ADMIN");
export const requireFarmer = requireRole("FARMER");
export const requireInvestor = requireRole("INVESTOR");

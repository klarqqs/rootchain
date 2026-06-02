import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../modules/auth/jwt.service.js";

export interface RequestWithAuth extends Request {
  auth?: { sub: string; email: string; role: string };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }
  try {
    const payload = verifyAccessToken(header.slice(7));
    (req as RequestWithAuth).auth = payload;
  } catch {
    /* ignore invalid token for public SSE */
  }
  next();
}

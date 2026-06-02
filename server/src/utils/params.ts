import type { Request } from "express";
import { AppError } from "./api-response.js";

export function requireParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || !value) {
    throw new AppError(400, "INVALID_PARAM", `Missing route parameter: ${name}`);
  }
  return value;
}

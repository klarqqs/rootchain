import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, sendError } from "../utils/api-response.js";
import { logger } from "../lib/logger.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  if (err instanceof ZodError) {
    sendError(res, 400, "VALIDATION_ERROR", "Invalid request data", err.flatten());
    return;
  }

  logger.error({ err }, "Unhandled error");
  sendError(res, 500, "INTERNAL_ERROR", "An unexpected error occurred");
}
